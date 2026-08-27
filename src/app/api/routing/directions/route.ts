/**
 * FleetMind AI — Server-Side Road Routing Proxy
 * POST /api/routing/directions
 *
 * This endpoint keeps the Mapbox token server-side and proxies
 * Directions API requests from the browser.
 *
 * Request body:
 *   { origin: [lng, lat], destination: [lng, lat], waypoints?: [[lng, lat], ...] }
 *
 * Response:
 *   RouteResult (see src/lib/routing/types.ts)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { LngLat, RouteLeg, RouteResult } from '../../../../lib/routing/types';
import { buildFallbackRoute } from '../../../../lib/routing/routing-service';

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  process.env.MAPBOX_TOKEN ||
  '';

export async function POST(req: NextRequest) {
  // 1. Parse request body
  let origin: LngLat, destination: LngLat, waypoints: LngLat[] = [];
  try {
    const body = await req.json();
    origin = body.origin;
    destination = body.destination;
    waypoints = body.waypoints ?? [];

    if (!origin || !destination || origin.length !== 2 || destination.length !== 2) {
      return NextResponse.json({ error: 'Invalid origin or destination' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. Build Mapbox Directions API URL
  // Coordinates: lng,lat;lng,lat;... (Mapbox order)
  const allCoords: LngLat[] = [origin, ...waypoints, destination];
  const coordStr = allCoords.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const mapboxUrl =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    `?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

  try {
    // 3. Call Mapbox Directions API
    const mbRes = await fetch(mapboxUrl, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!mbRes.ok) {
      throw new Error(`Mapbox error ${mbRes.status}: ${await mbRes.text()}`);
    }

    const mbData = await mbRes.json();

    if (!mbData.routes || mbData.routes.length === 0) {
      throw new Error('No routes returned from Mapbox');
    }

    const route = mbData.routes[0];

    // 4. Extract geometry (GeoJSON LineString coordinates = [lng, lat][])
    const geometry: LngLat[] = route.geometry.coordinates;

    // 5. Build per-leg data
    const legs: RouteLeg[] = (route.legs as any[]).map((leg: any, i: number) => {
      const legGeom: LngLat[] = leg.steps
        ? leg.steps.flatMap((step: any) => step.geometry?.coordinates ?? [])
        : [];

      return {
        geometry: legGeom.length > 0 ? legGeom : geometry,
        distance_km: Number((leg.distance / 1000).toFixed(2)),
        duration_minutes: Number((leg.duration / 60).toFixed(1)),
        summary: leg.summary || `Leg ${i + 1}`,
      };
    });

    // 6. Build final response
    const result: RouteResult = {
      geometry,
      total_distance_km: Number((route.distance / 1000).toFixed(2)),
      total_duration_minutes: Number((route.duration / 60).toFixed(1)),
      legs,
      is_fallback: false,
      fetched_at: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err) {
    // 7. Fallback — return Haversine approximation so the UI never breaks
    console.error('[/api/routing/directions] Mapbox error, using fallback:', err);

    const stops = allCoords.map(([lng, lat], i) => ({
      lat,
      lng,
      label: i === 0 ? 'Origin' : i === allCoords.length - 1 ? 'Destination' : `Waypoint ${i}`,
    }));

    const fallback = buildFallbackRoute(stops);
    return NextResponse.json(fallback);
  }
}

// Handle OPTIONS for CORS (not usually needed for same-origin Next.js)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
