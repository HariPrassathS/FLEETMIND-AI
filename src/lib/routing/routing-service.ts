/**
 * FleetMind AI — Routing Service
 *
 * Provider-agnostic routing abstraction. All routing calls go through
 * this module. To switch providers (Mapbox → OSRM → ORS), only the
 * fetch logic inside `fetchRoadRoute()` needs to change.
 *
 * Browser-side code MUST call `/api/routing/directions` (which proxies
 * to the provider). This module also exports pure math helpers that
 * work in both browser and server contexts.
 */

import type {
  EtaAnalysis,
  EtaRisk,
  LngLat,
  RouteLeg,
  RouteResult,
  RouteStop,
} from './types';

// ─── Pure Math Helpers ─────────────────────────────────────────────────────

/** Haversine great-circle distance in kilometres between two points. */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (lat1 === lat2 && lng1 === lng2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate true compass bearing in degrees (0 = North, 90 = East)
 * from point A to point B.
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(lng2 - lng1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/** Convert a bearing in degrees to a compass rose label. */
export function bearingToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Calculate total distance along a geometry array of [lng, lat] pairs.
 */
export function geometryDistance(coords: LngLat[]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += calculateDistance(
      coords[i][1],
      coords[i][0],
      coords[i + 1][1],
      coords[i + 1][0]
    );
  }
  return total;
}

/** Format minutes into a human-readable duration string. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

/** Format a time as HH:MM AM/PM */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── ETA Analysis ──────────────────────────────────────────────────────────

/**
 * Calculate ETA from current position on the route and compare against
 * the delivery deadline.
 *
 * @param remainingKm  Distance remaining on the route
 * @param avgSpeedKmh  Current or estimated average speed
 * @param deadline     ISO string or Date of delivery deadline
 */
export function calculateETA(
  remainingKm: number,
  avgSpeedKmh: number,
  deadline: string | Date
): EtaAnalysis {
  const speed = avgSpeedKmh > 0 ? avgSpeedKmh : 48;
  const travelMinutes = (remainingKm / speed) * 60;
  const estimated = new Date(Date.now() + travelMinutes * 60 * 1000);
  const dl = new Date(deadline);
  const bufferMs = dl.getTime() - estimated.getTime();
  const bufferMinutes = bufferMs / 60_000;

  let risk: EtaRisk;
  if (bufferMinutes > 30) risk = 'SAFE';
  else if (bufferMinutes >= 0) risk = 'AT_RISK';
  else risk = 'BREACHED';

  return {
    estimated_arrival: estimated,
    deadline: dl,
    buffer_minutes: Math.round(bufferMinutes),
    risk,
    formatted_eta: formatTime(estimated),
    formatted_deadline: formatTime(dl),
  };
}

// ─── Fallback Straight-Line Route ──────────────────────────────────────────

/**
 * Build a synthetic route from a list of stops without any road routing.
 * Used as a fallback when the routing API is unavailable.
 * Adds 3 intermediate points per leg to avoid perfectly straight lines.
 */
export function buildFallbackRoute(stops: RouteStop[]): RouteResult {
  if (stops.length < 2) throw new Error('At least 2 stops required');

  const legs: RouteLeg[] = [];
  const fullGeometry: LngLat[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const distKm = calculateDistance(from.lat, from.lng, to.lat, to.lng) * 1.28;

    // Approximate 3 intermediate points with tiny random offset to avoid perfect line
    const geo: LngLat[] = [[from.lng, from.lat]];
    for (let t = 0.25; t < 1; t += 0.25) {
      const lat = from.lat + (to.lat - from.lat) * t + (Math.random() - 0.5) * 0.02;
      const lng = from.lng + (to.lng - from.lng) * t + (Math.random() - 0.5) * 0.02;
      geo.push([lng, lat]);
    }
    geo.push([to.lng, to.lat]);

    legs.push({
      geometry: geo,
      distance_km: distKm,
      duration_minutes: (distKm / 48) * 60,
      summary: `${from.label || 'Stop ' + i} → ${to.label || 'Stop ' + (i + 1)}`,
    });

    // Merge geometry (avoid duplicate endpoints)
    fullGeometry.push(...(i === 0 ? geo : geo.slice(1)));
  }

  return {
    geometry: fullGeometry,
    total_distance_km: legs.reduce((s, l) => s + l.distance_km, 0),
    total_duration_minutes: legs.reduce((s, l) => s + l.duration_minutes, 0),
    legs,
    is_fallback: true,
    fetched_at: new Date().toISOString(),
  };
}

// ─── Client-Side Route Fetching ─────────────────────────────────────────────

/**
 * Fetch a road-accurate route via the server-side directions proxy.
 * Call this from BROWSER code (client components / useEffect).
 *
 * @param origin      Origin stop
 * @param destination Destination stop
 * @param waypoints   Optional intermediate stops
 */
export async function calculateRoute(
  origin: RouteStop,
  destination: RouteStop,
  waypoints: RouteStop[] = []
): Promise<RouteResult> {
  try {
    const res = await fetch('/api/routing/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: [origin.lng, origin.lat],
        destination: [destination.lng, destination.lat],
        waypoints: waypoints.map((w) => [w.lng, w.lat]),
      }),
    });

    if (!res.ok) throw new Error(`Routing API error: ${res.status}`);
    const data: RouteResult = await res.json();
    return data;
  } catch {
    // Fallback to Haversine-based straight-line approximation
    console.warn('[RoutingService] Road routing unavailable — using fallback route');
    return buildFallbackRoute([origin, ...waypoints, destination]);
  }
}

/**
 * Fetch a multi-stop route for a complete delivery run.
 * Stops should be in optimized visit order.
 */
export async function calculateMultiStopRoute(
  stops: RouteStop[]
): Promise<RouteResult> {
  if (stops.length < 2) throw new Error('Need at least 2 stops');
  const [origin, ...rest] = stops;
  const destination = rest[rest.length - 1];
  const waypoints = rest.slice(0, -1);
  return calculateRoute(origin, destination, waypoints);
}
