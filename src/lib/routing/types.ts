/**
 * FleetMind AI — Routing Service Type Definitions
 *
 * Provider-agnostic types used by the routing service abstraction.
 * The routing provider (Mapbox, OSRM, ORS) can be swapped without
 * changing any map component or optimization code.
 */

/** A geographic coordinate [longitude, latitude] in WGS84. */
export type LngLat = [number, number];

/** A single route leg (point A to point B on real roads). */
export interface RouteLeg {
  /** Ordered road geometry as [lng, lat] pairs */
  geometry: LngLat[];
  /** Road distance in kilometres */
  distance_km: number;
  /** Travel duration in minutes at average speed */
  duration_minutes: number;
  /** Human-readable summary of the leg (e.g. "NH48 via Hosur") */
  summary?: string;
}

/**
 * A complete route result — may contain multiple legs if waypoints
 * were provided (multi-stop route).
 */
export interface RouteResult {
  /** Combined geometry across all legs as a flat [lng, lat][] array */
  geometry: LngLat[];
  /** Sum of all leg distances in kilometres */
  total_distance_km: number;
  /** Sum of all leg durations in minutes */
  total_duration_minutes: number;
  /** Individual legs (one per origin→waypoint→destination segment) */
  legs: RouteLeg[];
  /** Whether this is a fallback straight-line estimate (no road data) */
  is_fallback?: boolean;
  /** ISO timestamp of when this route was fetched */
  fetched_at: string;
}

/** Input stop for multi-stop route planning */
export interface RouteStop {
  lat: number;
  lng: number;
  label?: string;
  deadline?: string;
  service_time_minutes?: number;
}

/**
 * A snapshot of a vehicle's GPS telemetry at a point in time.
 * Stored in the `vehicle_locations` table and broadcast via Supabase Realtime.
 */
export interface GpsTelemetry {
  lorry_id: string;
  driver_id?: string;
  latitude: number;
  longitude: number;
  /** Speed in km/h. Null if not available. */
  speed_kmh: number | null;
  /** True heading in degrees (0 = North, 90 = East, 180 = South, 270 = West) */
  heading_deg: number | null;
  /** GPS horizontal accuracy in metres. */
  accuracy_m?: number | null;
  /** ISO timestamp of when the reading was taken on the device */
  recorded_at: string;
}

/**
 * Computed ETA status compared against a deadline.
 * Used to drive status badges in the UI.
 */
export type EtaRisk = 'SAFE' | 'AT_RISK' | 'BREACHED';

export interface EtaAnalysis {
  estimated_arrival: Date;
  deadline: Date;
  buffer_minutes: number;
  risk: EtaRisk;
  formatted_eta: string;
  formatted_deadline: string;
}

/**
 * Live simulation state — tracks position along a route geometry.
 * The simulation advances through `geometry` index by index.
 */
export interface SimulationState {
  /** Index into the route geometry array */
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  completedDistanceKm: number;
  remainingDistanceKm: number;
  currentSpeedKmh: number;
  currentHeadingDeg: number;
  currentLat: number;
  currentLng: number;
  /** Whether simulation is active */
  isRunning: boolean;
  /** Whether this is a demo simulation (not real GPS) */
  isDemo: boolean;
  lastUpdated: string;
}
