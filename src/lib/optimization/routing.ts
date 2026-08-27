import { Coordinates, RouteStop, Shipment } from './types';

/**
 * Computes great-circle distance in km between two lat/lng coordinates
 * using Haversine formula, scaled by a winding road factor (default 1.28).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  roadFactor: number = 1.28
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;
  return Number((straightLineKm * roadFactor).toFixed(2));
}

export function calculateDistanceBetweenPoints(p1: Coordinates, p2: Coordinates, roadFactor = 1.28): number {
  return calculateHaversineDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng, roadFactor);
}

/**
 * Evaluates the total route distance for a sequence of stops starting from the lorry's start position.
 */
export function calculateRouteDistance(
  startPos: Coordinates,
  stops: { latitude: number; longitude: number }[],
  roadFactor: number = 1.28
): number {
  if (stops.length === 0) return 0;
  let total = calculateHaversineDistanceKm(startPos.lat, startPos.lng, stops[0].latitude, stops[0].longitude, roadFactor);
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateHaversineDistanceKm(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude,
      roadFactor
    );
  }
  return Number(total.toFixed(2));
}

/**
 * 2-opt Heuristic for TSP / VRP routing order improvement.
 * Ensures Pickups occur before their corresponding Deliveries while minimizing total circuit distance.
 */
export function optimizeRouteStops(
  startPos: Coordinates,
  stops: RouteStop[],
  roadFactor: number = 1.28
): RouteStop[] {
  if (stops.length <= 2) {
    return stops.map((s, idx) => ({ ...s, stop_sequence: idx + 1 }));
  }

  let bestOrder = [...stops];
  let bestDistance = calculateRouteDistance(startPos, bestOrder, roadFactor);
  let improved = true;
  let iteration = 0;
  const maxIterations = 50;

  // Helper to verify pickup precedence constraint
  const isValidPrecedence = (candidate: RouteStop[]): boolean => {
    const pickupIndices = new Map<string, number>();
    for (let i = 0; i < candidate.length; i++) {
      const stop = candidate[i];
      if (stop.stop_type === 'PICKUP') {
        pickupIndices.set(stop.shipment_id, i);
      } else if (stop.stop_type === 'DELIVERY') {
        const pickupIdx = pickupIndices.get(stop.shipment_id);
        if (pickupIdx === undefined || pickupIdx > i) {
          return false; // Delivery before pickup violation!
        }
      }
    }
    return true;
  };

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < bestOrder.length - 1; i++) {
      for (let j = i + 1; j < bestOrder.length; j++) {
        // 2-opt swap: reverse the sub-segment between i and j
        const candidate = [
          ...bestOrder.slice(0, i),
          ...bestOrder.slice(i, j + 1).reverse(),
          ...bestOrder.slice(j + 1),
        ];

        if (isValidPrecedence(candidate)) {
          const candDist = calculateRouteDistance(startPos, candidate, roadFactor);
          if (candDist < bestDistance - 0.05) {
            bestOrder = candidate;
            bestDistance = candDist;
            improved = true;
            break;
          }
        }
      }
      if (improved) break;
    }
  }

  return bestOrder.map((s, idx) => ({ ...s, stop_sequence: idx + 1 }));
}

/**
 * Builds initial stops for a list of shipments.
 * Grouped pickups first, then deliveries sorted by deadline/destination proximity.
 */
export function buildInitialStopsForShipments(
  routeId: string,
  shipments: Shipment[]
): RouteStop[] {
  const stops: RouteStop[] = [];

  // Pickups
  shipments.forEach((s) => {
    stops.push({
      id: `stop-${s.id}-pickup`,
      route_id: routeId,
      shipment_id: s.id,
      stop_sequence: 0,
      stop_type: 'PICKUP',
      latitude: s.pickup_lat,
      longitude: s.pickup_lng,
      address: `${s.pickup_address}, ${s.pickup_city}`,
      arrival_eta: new Date().toISOString(),
      deadline: s.delivery_deadline,
      status: 'PENDING',
    });
  });

  // Deliveries sorted by earliest deadline
  const sortedByDeadline = [...shipments].sort(
    (a, b) => new Date(a.delivery_deadline).getTime() - new Date(b.delivery_deadline).getTime()
  );

  sortedByDeadline.forEach((s) => {
    stops.push({
      id: `stop-${s.id}-delivery`,
      route_id: routeId,
      shipment_id: s.id,
      stop_sequence: 0,
      stop_type: 'DELIVERY',
      latitude: s.destination_lat,
      longitude: s.destination_lng,
      address: `${s.destination_address}, ${s.destination_city}`,
      arrival_eta: new Date().toISOString(),
      deadline: s.delivery_deadline,
      status: 'PENDING',
    });
  });

  return stops;
}
