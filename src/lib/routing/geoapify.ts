/**
 * FleetMind AI — Geoapify Routing, Geocoding & Route Matrix Engine
 * Integration with Geoapify API (Key: a48dac453c194c269d3ae0901dc34814)
 */

import type { LngLat, RouteLeg, RouteResult } from './types';

const GEOAPIFY_API_KEY =
  process.env.GEOAPIFY_API_KEY ||
  process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
  'a48dac453c194c269d3ae0901dc34814';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Searches and geocodes any text query or address worldwide using Geoapify Geocoding API.
 */
export async function geocodeAddressWithGeoapify(query: string): Promise<GeocodeResult | null> {
  if (!query || !query.trim()) return null;

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encoded}&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const top = data.features[0];
    const [lng, lat] = top.geometry.coordinates;

    return {
      lat,
      lng,
      formattedAddress: top.properties.formatted || query,
      city: top.properties.city || top.properties.name,
      state: top.properties.state,
      country: top.properties.country,
    };
  } catch (err) {
    console.warn('[Geoapify] Geocoding lookup failed:', err);
    return null;
  }
}

/**
 * Calculates high-precision turn-by-turn road route using Geoapify Routing API.
 */
export async function fetchGeoapifyRoute(
  origin: LngLat,
  destination: LngLat,
  waypoints: LngLat[] = []
): Promise<RouteResult | null> {
  try {
    const allPoints = [origin, ...waypoints, destination];
    // Geoapify waypoint format: lat,lon|lat,lon|...
    const waypointsParam = allPoints.map(([lng, lat]) => `${lat},${lng}`).join('|');
    const url = `https://api.geoapify.com/v1/routing?waypoints=${waypointsParam}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const props = feature.properties;

    // Geometry coordinates are array of legs -> [[lng, lat], ...]
    const geometryCoords: LngLat[] = feature.geometry.coordinates.flat(1);

    const legs: RouteLeg[] = (props.legs || []).map((leg: any, idx: number) => ({
      geometry: leg.steps?.flatMap((s: any) => s.geometry?.coordinates ?? []) || geometryCoords,
      distance_km: Number((leg.distance / 1000).toFixed(2)),
      duration_minutes: Number((leg.time / 60).toFixed(1)),
      summary: `Leg ${idx + 1}`,
    }));

    return {
      geometry: geometryCoords,
      total_distance_km: Number((props.distance / 1000).toFixed(2)),
      total_duration_minutes: Number((props.time / 60).toFixed(1)),
      legs,
      is_fallback: false,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[Geoapify] Routing lookup failed:', err);
    return null;
  }
}

/**
 * Calculates multi-source to multi-target distance & duration matrix using Geoapify Route Matrix API.
 */
export async function fetchGeoapifyRouteMatrix(
  sources: LngLat[],
  targets: LngLat[]
): Promise<Array<Array<{ distance_meters: number; time_seconds: number }>> | null> {
  try {
    const url = `https://api.geoapify.com/v1/routematrix?apiKey=${GEOAPIFY_API_KEY}`;
    const body = {
      mode: 'drive',
      sources: sources.map(([lng, lat]) => ({ location: [lng, lat] })),
      targets: targets.map(([lng, lat]) => ({ location: [lng, lat] })),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FleetMind-AI/1.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.sources_to_targets) return null;

    return data.sources_to_targets.map((row: any[]) =>
      row.map((cell: any) => ({
        distance_meters: cell.distance || 0,
        time_seconds: cell.time || 0,
      }))
    );
  } catch (err) {
    console.warn('[Geoapify] Route Matrix lookup failed:', err);
    return null;
  }
}
