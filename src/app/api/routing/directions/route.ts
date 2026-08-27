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
import { fetchGeoapifyRoute } from '../../../../lib/routing/geoapify';

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

  // Try 1: Geoapify Turn-by-Turn Real Routing
  try {
    const geoapifyRoute = await fetchGeoapifyRoute(origin, destination, waypoints);
    if (geoapifyRoute && geoapifyRoute.geometry && geoapifyRoute.geometry.length > 0) {
      return NextResponse.json(geoapifyRoute);
    }
  } catch (err) {
    console.warn('[/api/routing/directions] Geoapify failed, attempting OSRM / Mapbox...');
  }

  // 2. Build Coordinates string: lng,lat;lng,lat;...
  const allCoords: LngLat[] = [origin, ...waypoints, destination];
  const coordStr = allCoords.map(([lng, lat]) => `${lng},${lat}`).join(';');

  // Try 1: Mapbox Directions API if token exists
  if (MAPBOX_TOKEN) {
    try {
      const mapboxUrl =
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
        `?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;

      const mbRes = await fetch(mapboxUrl, {
        headers: { 'User-Agent': 'FleetMind-AI/1.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (mbRes.ok) {
        const mbData = await mbRes.json();
        if (mbData.routes && mbData.routes.length > 0) {
          const route = mbData.routes[0];
          const geometry: LngLat[] = route.geometry.coordinates;

          const legs: RouteLeg[] = (route.legs as any[]).map((leg: any, i: number) => ({
            geometry: leg.steps?.flatMap((s: any) => s.geometry?.coordinates ?? []) || geometry,
            distance_km: Number((leg.distance / 1000).toFixed(2)),
            duration_minutes: Number((leg.duration / 60).toFixed(1)),
            summary: leg.summary || `Leg ${i + 1}`,
          }));

          return NextResponse.json({
            geometry,
            total_distance_km: Number((route.distance / 1000).toFixed(2)),
            total_duration_minutes: Number((route.duration / 60).toFixed(1)),
            legs,
            is_fallback: false,
            fetched_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('[/api/routing/directions] Mapbox failed, attempting OSRM...');
    }
  }

  // Try 2: Open Source Routing Machine (OSRM) - 100% Free real highway routing
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`;
    const osrmRes = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];
        const geometry: LngLat[] = route.geometry.coordinates;

        const legs: RouteLeg[] = (route.legs as any[]).map((leg: any, i: number) => ({
          geometry: leg.steps?.flatMap((s: any) => s.geometry?.coordinates ?? []) || geometry,
          distance_km: Number((leg.distance / 1000).toFixed(2)),
          duration_minutes: Number((leg.duration / 60).toFixed(1)),
          summary: leg.summary || `Leg ${i + 1}`,
        }));

        return NextResponse.json({
          geometry,
          total_distance_km: Number((route.distance / 1000).toFixed(2)),
          total_duration_minutes: Number((route.duration / 60).toFixed(1)),
          legs,
          is_fallback: false,
          fetched_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('[/api/routing/directions] OSRM failed, using geometric interpolation...');
  }

  // Fallback: Haversine interpolation
  const stops = allCoords.map(([lng, lat], i) => ({
    lat,
    lng,
    label: i === 0 ? 'Origin' : i === allCoords.length - 1 ? 'Destination' : `Waypoint ${i}`,
  }));

  const fallback = buildFallbackRoute(stops);
  return NextResponse.json(fallback);
}

// Handle OPTIONS for CORS (not usually needed for same-origin Next.js)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
