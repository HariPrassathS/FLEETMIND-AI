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

export interface PlaceResult {
  name: string;
  category: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  distanceMeters?: number;
}

/**
 * Returns Geoapify Raster Tile URL for Leaflet Map Rendering.
 * Styles: 'carto', 'osm-bright', 'positron', 'dark-matter', 'klokantech-basic'
 */
export function getGeoapifyTileUrl(style: string = 'carto'): string {
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Autocomplete address or landmark query using Geoapify Autocomplete API.
 */
export async function geocodeAutocompleteWithGeoapify(text: string): Promise<GeocodeResult[]> {
  if (!text || text.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(text.trim());
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encoded}&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features) return [];

    return data.features.map((f: any) => {
      const [lng, lat] = f.geometry.coordinates;
      return {
        lat,
        lng,
        formattedAddress: f.properties.formatted || text,
        city: f.properties.city || f.properties.name,
        state: f.properties.state,
        country: f.properties.country,
      };
    });
  } catch (err) {
    console.warn('[Geoapify] Autocomplete lookup failed:', err);
    return [];
  }
}

/**
 * Searches places, fuel stations, logistics depots, and supermarkets using Geoapify Places API.
 */
export async function fetchGeoapifyPlaces(
  categories: string = 'commercial.supermarket,service.vehicle.fuel',
  filterRect?: string
): Promise<PlaceResult[]> {
  try {
    const filterParam = filterRect ? `&filter=rect:${encodeURIComponent(filterRect)}` : '';
    const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(categories)}${filterParam}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features) return [];

    return data.features.map((f: any) => {
      const [lng, lat] = f.geometry.coordinates;
      return {
        name: f.properties.name || f.properties.formatted || 'Commercial Point',
        category: f.properties.categories?.[0] || categories,
        formattedAddress: f.properties.formatted || '',
        lat,
        lng,
        distanceMeters: f.properties.distance,
      };
    });
  } catch (err) {
    console.warn('[Geoapify] Places API lookup failed:', err);
    return [];
  }
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

export interface RoutePlannerAgent {
  start_location: [number, number]; // [lng, lat]
  end_location?: [number, number];   // [lng, lat]
  pickup_capacity?: number;
}

export interface RoutePlannerJob {
  location: [number, number];        // [lng, lat]
  duration?: number;                 // duration in seconds (e.g. 300)
  pickup_amount?: number;
}

/**
 * Solves Vehicle Routing Problem (VRP) using Geoapify Route Planner API.
 */
export async function fetchGeoapifyRoutePlanner(
  agents: RoutePlannerAgent[],
  jobs: RoutePlannerJob[]
): Promise<any | null> {
  try {
    const url = `https://api.geoapify.com/v1/routeplanner?apiKey=${GEOAPIFY_API_KEY}`;
    const body = {
      mode: 'drive',
      agents,
      jobs,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FleetMind-AI/1.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[Geoapify] Route Planner optimization failed:', err);
    return null;
  }
}

export interface IPInfoResult {
  ip: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  postalCode?: string;
  currency?: string;
}

/**
 * Automatically detects caller or specified IP geolocation using Geoapify IP Info API.
 */
export async function fetchGeoapifyIPInfo(ip?: string): Promise<IPInfoResult | null> {
  try {
    const ipParam = ip ? `&ip=${encodeURIComponent(ip)}` : '';
    const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${GEOAPIFY_API_KEY}${ipParam}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'FleetMind-AI/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city?.name || 'Chennai',
      state: data.state?.name || 'Tamil Nadu',
      country: data.country?.name || 'India',
      lat: data.location?.latitude || 13.0827,
      lng: data.location?.longitude || 80.2707,
      postalCode: data.postal?.code,
      currency: data.country?.currency,
    };
  } catch (err) {
    console.warn('[Geoapify] IP Info lookup failed:', err);
    return null;
  }
}
