import { Coordinates, DeadlineClassification, RouteStop, Shipment, SystemSettings } from './types';
import { calculateHaversineDistanceKm } from './routing';

export interface ETAResult {
  calculated_eta: Date;
  total_duration_minutes: number;
  travel_time_minutes: number;
  service_time_minutes: number;
  loading_time_minutes: number;
  traffic_delay_minutes: number;
  status: DeadlineClassification;
  margin_minutes: number;
}

/**
 * Calculates ETA for a shipment or stop along a route.
 * ETA = Current Time + Travel Time + Loading Time + Service Time + Traffic Delay
 */
export function calculateStopETAs(
  startPos: Coordinates,
  stops: RouteStop[],
  startTime: Date = new Date(),
  settings: Pick<SystemSettings, 'average_speed_km_per_h' | 'loading_time_minutes' | 'service_time_per_stop_mins' | 'road_distance_factor'>
): RouteStop[] {
  let currentPos = startPos;
  let accumulatedMinutes = 0;

  return stops.map((stop) => {
    // Travel time to this stop
    const distKm = calculateHaversineDistanceKm(
      currentPos.lat,
      currentPos.lng,
      stop.latitude,
      stop.longitude,
      settings.road_distance_factor
    );
    const speed = Math.max(20, settings.average_speed_km_per_h || 45);
    const legTravelMinutes = (distKm / speed) * 60;
    
    // Add handling time (loading at pickup, service at delivery)
    const handlingMinutes = stop.stop_type === 'PICKUP' 
      ? settings.loading_time_minutes 
      : settings.service_time_per_stop_mins;

    accumulatedMinutes += legTravelMinutes + handlingMinutes;

    const arrivalDate = new Date(startTime.getTime() + accumulatedMinutes * 60 * 1000);
    currentPos = { lat: stop.latitude, lng: stop.longitude };

    return {
      ...stop,
      arrival_eta: arrivalDate.toISOString(),
    };
  });
}

/**
 * Classifies deadline feasibility:
 * - SAFE: ETA is at least 45 minutes before deadline
 * - AT_RISK: ETA is within 45 minutes of deadline or slightly overdue (< 15 mins)
 * - BREACHED: ETA exceeds deadline by > 15 mins
 */
export function classifyDeadlineStatus(
  etaIso: string,
  deadlineIso: string
): DeadlineClassification {
  const etaTime = new Date(etaIso).getTime();
  const deadlineTime = new Date(deadlineIso).getTime();
  const marginMinutes = (deadlineTime - etaTime) / (1000 * 60);

  if (marginMinutes >= 45) {
    return 'SAFE';
  } else if (marginMinutes >= -15) {
    return 'AT_RISK';
  } else {
    return 'BREACHED';
  }
}

/**
 * Validates whether all shipments on a route satisfy their delivery deadlines.
 */
export function validateRouteDeadlines(
  stops: RouteStop[],
  shipments: Shipment[]
): {
  isFeasible: boolean;
  breachedCount: number;
  atRiskCount: number;
  stopStatuses: Map<string, DeadlineClassification>;
} {
  const shipmentMap = new Map(shipments.map((s) => [s.id, s]));
  let breachedCount = 0;
  let atRiskCount = 0;
  const stopStatuses = new Map<string, DeadlineClassification>();

  for (const stop of stops) {
    if (stop.stop_type === 'DELIVERY') {
      const shipment = shipmentMap.get(stop.shipment_id);
      const deadline = shipment?.delivery_deadline || stop.deadline || new Date(Date.now() + 24 * 3600000).toISOString();
      const status = classifyDeadlineStatus(stop.arrival_eta, deadline);
      stopStatuses.set(stop.id, status);

      if (status === 'BREACHED') breachedCount++;
      if (status === 'AT_RISK') atRiskCount++;
    }
  }

  return {
    isFeasible: breachedCount === 0,
    breachedCount,
    atRiskCount,
    stopStatuses,
  };
}
