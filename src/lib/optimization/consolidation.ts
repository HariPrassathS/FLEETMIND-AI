import {
  ConsolidationAnalysisResult,
  ConsolidationOption,
  CorridorCompatibilityLevel,
  Driver,
  Lorry,
  Route,
  RouteStop,
  Shipment,
  SystemSettings,
  Trip,
} from './types';
import { calculateHaversineDistanceKm } from './routing';
import { DEFAULT_SYSTEM_SETTINGS } from './optimizer';

/**
 * Calculates geographic bearing between two coordinate points in degrees (0-360).
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos((lon2 - lon1) * (Math.PI / 180));
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Evaluates corridor compatibility between an existing route vector and a new shipment vector.
 */
function evaluateCorridorCompatibility(
  tripOrigin: { lat: number; lng: number },
  tripDest: { lat: number; lng: number },
  pickup: { lat: number; lng: number },
  delivery: { lat: number; lng: number }
): CorridorCompatibilityLevel {
  const tripBearing = calculateBearing(tripOrigin.lat, tripOrigin.lng, tripDest.lat, tripDest.lng);
  const shipmentBearing = calculateBearing(pickup.lat, pickup.lng, delivery.lat, delivery.lng);

  // Angular difference between trajectory bearings
  let angleDiff = Math.abs(tripBearing - shipmentBearing);
  if (angleDiff > 180) angleDiff = 360 - angleDiff;

  // Distance from pickup to trip line segment
  const distPickupToDest = calculateHaversineDistanceKm(pickup.lat, pickup.lng, tripDest.lat, tripDest.lng);
  const distDeliveryToDest = calculateHaversineDistanceKm(delivery.lat, delivery.lng, tripDest.lat, tripDest.lng);

  if (angleDiff <= 35 && distDeliveryToDest <= 40) return 'EXCELLENT';
  if (angleDiff <= 60 && distDeliveryToDest <= 80) return 'GOOD';
  if (angleDiff <= 90 || distPickupToDest <= 100) return 'MODERATE';
  if (angleDiff <= 130) return 'POOR';
  return 'INCOMPATIBLE';
}

/**
 * Computes total road distance for an ordered array of route stops.
 */
function computeStopsDistance(
  startPos: { lat: number; lng: number },
  stops: RouteStop[],
  roadFactor = 1.28
): number {
  if (stops.length === 0) return 0;
  let totalKm = calculateHaversineDistanceKm(startPos.lat, startPos.lng, stops[0].latitude, stops[0].longitude, roadFactor);
  for (let i = 0; i < stops.length - 1; i++) {
    totalKm += calculateHaversineDistanceKm(
      stops[i].latitude,
      stops[i].longitude,
      stops[i + 1].latitude,
      stops[i + 1].longitude,
      roadFactor
    );
  }
  return Number(totalKm.toFixed(1));
}

/**
 * Evaluates candidate trip for consolidation insertion of a new shipment.
 */
function evaluateTripConsolidation(
  newShipment: Shipment,
  trip: Trip,
  route: Route | undefined,
  lorry: Lorry,
  driver: Driver | undefined,
  existingShipmentsOnTrip: Shipment[],
  settings: SystemSettings
): ConsolidationOption {
  const roadFactor = settings.road_distance_factor || 1.28;
  const currentLorryPos = { lat: lorry.current_lat || 13.0827, lng: lorry.current_lng || 80.2707 };

  // 1. Capacity Calculations
  const current_weight_kg = existingShipmentsOnTrip.reduce((sum, s) => sum + (s.weight_kg || 0), 0);
  const current_volume_m3 = Number(existingShipmentsOnTrip.reduce((sum, s) => sum + (s.volume_m3 || 0), 0).toFixed(1));

  const projected_weight_kg = current_weight_kg + newShipment.weight_kg;
  const projected_volume_m3 = Number((current_volume_m3 + newShipment.volume_m3).toFixed(1));

  const max_weight_kg = lorry.max_weight_kg;
  const max_volume_m3 = lorry.max_volume_m3;

  const current_weight_util_pct = Math.round((current_weight_kg / max_weight_kg) * 100);
  const projected_weight_util_pct = Math.round((projected_weight_kg / max_weight_kg) * 100);
  const remaining_weight_kg = Math.max(0, max_weight_kg - projected_weight_kg);

  const current_volume_util_pct = Math.round((current_volume_m3 / max_volume_m3) * 100);
  const projected_volume_util_pct = Math.round((projected_volume_m3 / max_volume_m3) * 100);
  const remaining_volume_m3 = Math.max(0, Number((max_volume_m3 - projected_volume_m3).toFixed(1)));

  const is_weight_ok = projected_weight_kg <= max_weight_kg;
  const is_volume_ok = projected_volume_m3 <= max_volume_m3;

  // 2. Existing Route & Waypoints Extraction
  const existingStops: RouteStop[] = route?.stops && route.stops.length > 0
    ? [...route.stops]
    : [
        {
          id: `stop-orig-${trip.id}`,
          route_id: route?.id || `RT-${trip.id}`,
          shipment_id: existingShipmentsOnTrip[0]?.id || 'base',
          stop_sequence: 1,
          stop_type: 'PICKUP',
          latitude: currentLorryPos.lat,
          longitude: currentLorryPos.lng,
          address: `${trip.origin_city} Depot`,
          arrival_eta: new Date().toISOString(),
          status: 'COMPLETED',
        },
        {
          id: `stop-dest-${trip.id}`,
          route_id: route?.id || `RT-${trip.id}`,
          shipment_id: existingShipmentsOnTrip[0]?.id || 'base',
          stop_sequence: 2,
          stop_type: 'DELIVERY',
          latitude: newShipment.destination_lat || 11.0168,
          longitude: newShipment.destination_lng || 76.9558,
          address: `${trip.destination_city} Consignee Bay`,
          arrival_eta: new Date(Date.now() + 6 * 3600000).toISOString(),
          status: 'PENDING',
        },
      ];

  const current_route_distance_km = route?.total_distance_km && route.total_distance_km > 0
    ? route.total_distance_km
    : computeStopsDistance(currentLorryPos, existingStops, roadFactor);

  // 3. Optimal Stop Insertion (Testing all valid pickup -> delivery position pairs)
  const newPickupStop: RouteStop = {
    id: `stop-pu-${newShipment.id}`,
    route_id: route?.id || `RT-${trip.id}`,
    shipment_id: newShipment.id,
    stop_sequence: 0,
    stop_type: 'PICKUP',
    latitude: newShipment.pickup_lat,
    longitude: newShipment.pickup_lng,
    address: newShipment.pickup_address || `${newShipment.pickup_city} Logistics Hub`,
    arrival_eta: '',
    status: 'PENDING',
  };

  const newDeliveryStop: RouteStop = {
    id: `stop-del-${newShipment.id}`,
    route_id: route?.id || `RT-${trip.id}`,
    shipment_id: newShipment.id,
    stop_sequence: 0,
    stop_type: 'DELIVERY',
    latitude: newShipment.destination_lat,
    longitude: newShipment.destination_lng,
    address: newShipment.destination_address || `${newShipment.destination_city} Consignee Dock`,
    arrival_eta: '',
    status: 'PENDING',
  };

  let bestInsertedStops: RouteStop[] = [];
  let bestDistanceKm = Infinity;

  // Permutation search: insert pickup at index i, delivery at index j (i <= j)
  for (let i = 0; i <= existingStops.length; i++) {
    for (let j = i; j <= existingStops.length; j++) {
      const candidateStops = [...existingStops];
      candidateStops.splice(i, 0, newPickupStop);
      candidateStops.splice(j + 1, 0, newDeliveryStop);

      const candidateDist = computeStopsDistance(currentLorryPos, candidateStops, roadFactor);
      if (candidateDist < bestDistanceKm) {
        bestDistanceKm = candidateDist;
        bestInsertedStops = candidateStops.map((st, idx) => ({
          ...st,
          stop_sequence: idx + 1,
        }));
      }
    }
  }

  const projected_route_distance_km = Number(bestDistanceKm.toFixed(1));
  const additional_distance_km = Number(Math.max(0, projected_route_distance_km - current_route_distance_km).toFixed(1));

  // Additional travel time (speed = 48 km/h + 20 mins per stop handling)
  const avgSpeed = settings.average_speed_km_per_h || 48;
  const additionalDriveMins = Math.round((additional_distance_km / avgSpeed) * 60);
  const additionalHandlingMins = 40; // 20m pickup + 20m delivery
  const additional_time_minutes = additionalDriveMins + additionalHandlingMins;

  // Pickup route deviation
  const pickup_deviation_km = Number((additional_distance_km * 0.45).toFixed(1));

  // Corridor compatibility
  const tripOriginCoords = existingStops[0] ? { lat: existingStops[0].latitude, lng: existingStops[0].longitude } : currentLorryPos;
  const tripDestCoords = existingStops[existingStops.length - 1]
    ? { lat: existingStops[existingStops.length - 1].latitude, lng: existingStops[existingStops.length - 1].longitude }
    : { lat: newShipment.destination_lat, lng: newShipment.destination_lng };

  const corridor_compatibility = evaluateCorridorCompatibility(
    tripOriginCoords,
    tripDestCoords,
    { lat: newShipment.pickup_lat, lng: newShipment.pickup_lng },
    { lat: newShipment.destination_lat, lng: newShipment.destination_lng }
  );

  // 4. Deadline & SLA Check with Priority Rules
  let is_deadline_feasible = true;
  let minDeadlineBufferMins = Infinity;
  let cumDistance = 0;
  let cumTimeMins = 0;
  const nowMs = Date.now();
  let lastPos = currentLorryPos;

  const allShipmentsMap = new Map<string, Shipment>();
  [...existingShipmentsOnTrip, newShipment].forEach((s) => allShipmentsMap.set(s.id, s));

  for (let idx = 0; idx < bestInsertedStops.length; idx++) {
    const stop = bestInsertedStops[idx];
    if (stop.status === 'COMPLETED') {
      continue;
    }

    const legDist = calculateHaversineDistanceKm(lastPos.lat, lastPos.lng, stop.latitude, stop.longitude, roadFactor);
    lastPos = { lat: stop.latitude, lng: stop.longitude };
    cumDistance += legDist;
    cumTimeMins += Math.round((legDist / avgSpeed) * 60) + (settings.service_time_per_stop_mins || 20);

    const etaDate = new Date(nowMs + cumTimeMins * 60000);
    stop.arrival_eta = etaDate.toISOString();

    if (stop.stop_type === 'DELIVERY') {
      const targetShipment = allShipmentsMap.get(stop.shipment_id);
      if (targetShipment && targetShipment.delivery_deadline) {
        const deadlineMs = new Date(targetShipment.delivery_deadline).getTime();
        const bufferMins = Math.round((deadlineMs - etaDate.getTime()) / 60000);
        if (bufferMins < minDeadlineBufferMins) {
          minDeadlineBufferMins = bufferMins;
        }

        // CRITICAL priority requires minimum 30-minute buffer and zero breach
        if (targetShipment.priority === 'CRITICAL') {
          if (bufferMins < 30) {
            is_deadline_feasible = false;
          }
        } else if (targetShipment.priority === 'HIGH') {
          if (bufferMins < 15) {
            is_deadline_feasible = false;
          }
        } else {
          if (bufferMins < 0) {
            is_deadline_feasible = false;
          }
        }
      }
    }
  }

  // 5. Cost & Fuel Calculations
  const fuel_efficiency_km_per_l = lorry.fuel_efficiency_km_per_l || 7.0;
  const additional_fuel_liters = Number((additional_distance_km / fuel_efficiency_km_per_l).toFixed(2));
  const additional_fuel_cost_inr = Math.round(additional_fuel_liters * settings.fuel_price_per_liter);

  // Toll cost calculation
  const additional_toll_inr = Math.round(additional_distance_km * 2.2);

  // Incremental driver cost (no double charge on base shift)
  const additional_driver_cost_inr = Math.round(additional_distance_km * (settings.driver_base_rate_per_km * 0.45));

  const incremental_cost_inr = additional_fuel_cost_inr + additional_toll_inr + additional_driver_cost_inr + 250;

  // Standalone new vehicle dispatch baseline cost (for comparative savings)
  const directDistanceKm = calculateHaversineDistanceKm(
    newShipment.pickup_lat,
    newShipment.pickup_lng,
    newShipment.destination_lat,
    newShipment.destination_lng,
    roadFactor
  );
  const standaloneFuelL = directDistanceKm / 6.0;
  const standaloneFuelCost = standaloneFuelL * settings.fuel_price_per_liter;
  const standaloneDriverCost = directDistanceKm * settings.driver_base_rate_per_km;
  const standaloneToll = directDistanceKm * 2.2;
  const standalone_new_vehicle_cost_inr = Math.round(
    standaloneFuelCost + standaloneDriverCost + standaloneToll + settings.fixed_dispatch_cost_per_lorry
  );

  const net_savings_inr = Math.max(0, standalone_new_vehicle_cost_inr - incremental_cost_inr);

  // 6. Overall Feasibility & Rule Validation
  const is_driver_ok = Boolean(driver && (driver.availability_status === 'AVAILABLE' || driver.availability_status === 'ON_DUTY'));
  const is_lorry_ok = lorry.status === 'AVAILABLE' || lorry.status === 'ON_ROUTE' || lorry.status === 'LOADING';
  const is_feasible = is_weight_ok && is_volume_ok && is_deadline_feasible && is_driver_ok && is_lorry_ok && additional_distance_km <= 150;

  // 7. Reasons & Explanation Bullets
  const reasons: string[] = [];
  const warning_reasons: string[] = [];

  if (is_weight_ok) {
    reasons.push(`✓ ${newShipment.weight_kg} kg weight fits easily (${projected_weight_util_pct}% total vehicle payload)`);
  } else {
    warning_reasons.push(`❌ Exceeds max payload (${projected_weight_kg} kg / ${max_weight_kg} kg)`);
  }

  if (is_volume_ok) {
    reasons.push(`✓ ${newShipment.volume_m3} m³ volume fits into cargo hold (${projected_volume_util_pct}% container load)`);
  } else {
    warning_reasons.push(`❌ Exceeds max volume (${projected_volume_m3} m³ / ${max_volume_m3} m³)`);
  }

  if (corridor_compatibility === 'EXCELLENT' || corridor_compatibility === 'GOOD') {
    reasons.push(`✓ High corridor alignment along ${trip.origin_city} ➔ ${trip.destination_city}`);
  }

  if (additional_distance_km <= 45) {
    reasons.push(`✓ Minimal route detour of only +${additional_distance_km} km (+${additional_time_minutes} mins)`);
  } else {
    warning_reasons.push(`⚠️ Detour of +${additional_distance_km} km is substantial`);
  }

  if (is_deadline_feasible) {
    reasons.push(`✓ Delivery deadline compliant with +${Math.max(0, minDeadlineBufferMins)} min on-time safety buffer`);
  } else {
    warning_reasons.push(`❌ Fails delivery deadline by ${Math.abs(minDeadlineBufferMins)} minutes`);
  }

  if (net_savings_inr > 0 && is_feasible) {
    reasons.push(`✓ Saves ₹${net_savings_inr.toLocaleString()} by eliminating a 2nd vehicle dispatch`);
  }

  // 8. Deterministic Composite Scoring (0 - 100)
  let score = 0;
  if (is_feasible) {
    score += 35; // Base feasibility
    score += Math.max(0, 25 - Math.round(additional_distance_km * 0.5)); // Detour efficiency
    score += Math.min(15, Math.round((projected_weight_util_pct / 100) * 15)); // Load utilization
    score += Math.min(15, Math.round((fuel_efficiency_km_per_l / 10) * 15)); // Fuel economy
    score += Math.min(10, Math.max(0, Math.round(minDeadlineBufferMins / 10))); // SLA buffer
  } else {
    score = Math.max(5, 30 - (is_weight_ok ? 0 : 15) - (is_volume_ok ? 0 : 15) - (is_deadline_feasible ? 0 : 20));
  }

  const projected_eta = bestInsertedStops.find((s) => s.shipment_id === newShipment.id && s.stop_type === 'DELIVERY')?.arrival_eta || newShipment.delivery_deadline;

  return {
    option_id: `cons-trip-${trip.id}`,
    decision_type: is_feasible && net_savings_inr >= 500 ? 'ADD_TO_EXISTING_TRIP' : 'ASSIGN_NEW_VEHICLE',
    lorry,
    driver,
    trip_id: trip.id,
    route_id: route?.id,
    is_existing_trip: true,
    existing_corridor: `${trip.origin_city} ➔ ${trip.destination_city}`,
    new_pickup_city: newShipment.pickup_city,
    new_destination_city: newShipment.destination_city,

    current_weight_kg,
    new_shipment_weight_kg: newShipment.weight_kg,
    projected_weight_kg,
    max_weight_kg,
    current_weight_util_pct,
    projected_weight_util_pct,
    remaining_weight_kg,

    current_volume_m3,
    new_shipment_volume_m3: newShipment.volume_m3,
    projected_volume_m3,
    max_volume_m3,
    current_volume_util_pct,
    projected_volume_util_pct,
    remaining_volume_m3,

    current_route_distance_km,
    projected_route_distance_km,
    additional_distance_km,
    additional_time_minutes,
    pickup_deviation_km,
    corridor_compatibility,

    fuel_efficiency_km_per_l,
    additional_fuel_liters,
    additional_fuel_cost_inr,
    additional_toll_inr,
    additional_driver_cost_inr,
    incremental_cost_inr,
    standalone_new_vehicle_cost_inr,
    net_savings_inr,

    is_feasible,
    is_deadline_feasible,
    deadline_buffer_minutes: minDeadlineBufferMins === Infinity ? 60 : minDeadlineBufferMins,
    projected_eta,
    delivery_deadline: newShipment.delivery_deadline,

    deterministic_score: Math.min(99, Math.max(5, score)),
    reasons,
    warning_reasons,
    proposed_stops_sequence: bestInsertedStops,
  };
}

/**
 * Evaluates standalone new vehicle dispatch option.
 */
function evaluateStandaloneNewVehicle(
  newShipment: Shipment,
  lorry: Lorry,
  driver: Driver | undefined,
  settings: SystemSettings
): ConsolidationOption {
  const roadFactor = settings.road_distance_factor || 1.28;
  const currentLorryPos = { lat: lorry.current_lat || 13.0827, lng: lorry.current_lng || 80.2707 };

  // Deadhead positioning distance
  const deadheadDistKm = calculateHaversineDistanceKm(
    currentLorryPos.lat,
    currentLorryPos.lng,
    newShipment.pickup_lat,
    newShipment.pickup_lng,
    roadFactor
  );

  // Direct delivery distance
  const directDistKm = calculateHaversineDistanceKm(
    newShipment.pickup_lat,
    newShipment.pickup_lng,
    newShipment.destination_lat,
    newShipment.destination_lng,
    roadFactor
  );

  const totalDistKm = Number((deadheadDistKm + directDistKm).toFixed(1));
  const avgSpeed = settings.average_speed_km_per_h || 48;
  const totalDurationMins = Math.round((totalDistKm / avgSpeed) * 60) + 40;

  const fuel_efficiency_km_per_l = lorry.fuel_efficiency_km_per_l || 6.5;
  const fuelLiters = Number((totalDistKm / fuel_efficiency_km_per_l).toFixed(2));
  const fuelCost = Math.round(fuelLiters * settings.fuel_price_per_liter);
  const driverCost = Math.round(totalDistKm * settings.driver_base_rate_per_km);
  const tollCost = Math.round(totalDistKm * 2.2);
  const totalCost = Math.round(fuelCost + driverCost + tollCost + settings.fixed_dispatch_cost_per_lorry);

  const is_weight_ok = newShipment.weight_kg <= lorry.max_weight_kg;
  const is_volume_ok = newShipment.volume_m3 <= lorry.max_volume_m3;
  const is_driver_ok = Boolean(driver && (driver.availability_status === 'AVAILABLE' || driver.availability_status === 'ON_DUTY'));
  const is_lorry_ok = lorry.status === 'AVAILABLE' || lorry.status === 'LOADING';

  const weight_util_pct = Math.round((newShipment.weight_kg / lorry.max_weight_kg) * 100);
  const volume_util_pct = Math.round((newShipment.volume_m3 / lorry.max_volume_m3) * 100);

  const projected_eta = new Date(Date.now() + totalDurationMins * 60000).toISOString();
  const deadlineMs = new Date(newShipment.delivery_deadline).getTime();
  const bufferMins = Math.round((deadlineMs - new Date(projected_eta).getTime()) / 60000);
  const is_deadline_feasible = bufferMins >= 0;

  const is_feasible = is_weight_ok && is_volume_ok && is_driver_ok && is_lorry_ok && is_deadline_feasible;

  const reasons: string[] = [];
  const warning_reasons: string[] = [];

  if (is_feasible) {
    reasons.push(`✓ Dedicated carrier ${lorry.lorry_code} standby near pickup (${deadheadDistKm} km deadhead)`);
    reasons.push(`✓ 100% dedicated capacity for this consignment`);
    reasons.push(`✓ Full trip arrival in ${Math.round(totalDurationMins / 60)}h ${totalDurationMins % 60}m`);
  } else {
    if (!is_weight_ok) warning_reasons.push(`❌ Insufficient payload capacity (${lorry.max_weight_kg} kg)`);
    if (!is_volume_ok) warning_reasons.push(`❌ Insufficient volume capacity (${lorry.max_volume_m3} m³)`);
    if (!is_deadline_feasible) warning_reasons.push(`❌ Cannot meet delivery deadline by ${Math.abs(bufferMins)} mins`);
  }

  // Deterministic Score (0 - 100)
  let score = 0;
  if (is_feasible) {
    score += 25; // Base
    score += Math.max(0, 25 - Math.round(deadheadDistKm * 0.5)); // Proximity
    score += Math.min(15, Math.round((weight_util_pct / 100) * 15)); // Utilization
    score += Math.min(15, Math.round((fuel_efficiency_km_per_l / 10) * 15)); // Economy
    score += is_deadline_feasible ? 10 : 0;
  } else {
    score = Math.max(5, 20 - (is_weight_ok ? 0 : 10) - (is_volume_ok ? 0 : 10));
  }

  const stops: RouteStop[] = [
    {
      id: `stop-pu-${newShipment.id}`,
      route_id: `RT-NEW-${lorry.lorry_code}`,
      shipment_id: newShipment.id,
      stop_sequence: 1,
      stop_type: 'PICKUP',
      latitude: newShipment.pickup_lat,
      longitude: newShipment.pickup_lng,
      address: newShipment.pickup_address,
      arrival_eta: new Date(Date.now() + Math.round((deadheadDistKm / avgSpeed) * 60000)).toISOString(),
      status: 'PENDING',
    },
    {
      id: `stop-del-${newShipment.id}`,
      route_id: `RT-NEW-${lorry.lorry_code}`,
      shipment_id: newShipment.id,
      stop_sequence: 2,
      stop_type: 'DELIVERY',
      latitude: newShipment.destination_lat,
      longitude: newShipment.destination_lng,
      address: newShipment.destination_address,
      arrival_eta: projected_eta,
      status: 'PENDING',
    },
  ];

  return {
    option_id: `new-vehicle-${lorry.id}`,
    decision_type: 'ASSIGN_NEW_VEHICLE',
    lorry,
    driver,
    is_existing_trip: false,
    existing_corridor: 'Dedicated Standby Dispatch',
    new_pickup_city: newShipment.pickup_city,
    new_destination_city: newShipment.destination_city,

    current_weight_kg: 0,
    new_shipment_weight_kg: newShipment.weight_kg,
    projected_weight_kg: newShipment.weight_kg,
    max_weight_kg: lorry.max_weight_kg,
    current_weight_util_pct: 0,
    projected_weight_util_pct: weight_util_pct,
    remaining_weight_kg: Math.max(0, lorry.max_weight_kg - newShipment.weight_kg),

    current_volume_m3: 0,
    new_shipment_volume_m3: newShipment.volume_m3,
    projected_volume_m3: newShipment.volume_m3,
    max_volume_m3: lorry.max_volume_m3,
    current_volume_util_pct: 0,
    projected_volume_util_pct: volume_util_pct,
    remaining_volume_m3: Math.max(0, Number((lorry.max_volume_m3 - newShipment.volume_m3).toFixed(1))),

    current_route_distance_km: 0,
    projected_route_distance_km: totalDistKm,
    additional_distance_km: totalDistKm,
    additional_time_minutes: totalDurationMins,
    pickup_deviation_km: deadheadDistKm,
    corridor_compatibility: 'EXCELLENT',

    fuel_efficiency_km_per_l,
    additional_fuel_liters: fuelLiters,
    additional_fuel_cost_inr: fuelCost,
    additional_toll_inr: tollCost,
    additional_driver_cost_inr: driverCost,
    incremental_cost_inr: totalCost,
    standalone_new_vehicle_cost_inr: totalCost,
    net_savings_inr: 0,

    is_feasible,
    is_deadline_feasible,
    deadline_buffer_minutes: bufferMins,
    projected_eta,
    delivery_deadline: newShipment.delivery_deadline,

    deterministic_score: Math.min(95, Math.max(5, score)),
    reasons,
    warning_reasons,
    proposed_stops_sequence: stops,
  };
}

/**
 * SmartConsolidationEngine
 * Analyzes whether a newly arrived or unassigned shipment should be CONSOLIDATED into
 * an existing active/planned trip or assigned to a new standalone vehicle.
 */
export class SmartConsolidationEngine {
  public static analyzeShipment(
    shipment: Shipment,
    trips: Trip[],
    routes: Route[],
    lorries: Lorry[],
    drivers: Driver[],
    allShipments: Shipment[],
    settings: SystemSettings = DEFAULT_SYSTEM_SETTINGS
  ): ConsolidationAnalysisResult {
    // 1. Analyze All Active/Planned Trips for Consolidation Insertion
    const candidateTrips: ConsolidationOption[] = [];

    const activeTrips = trips.filter(
      (t) => t.status === 'PLANNED' || t.status === 'APPROVED' || t.status === 'IN_PROGRESS'
    );

    for (const trip of activeTrips) {
      const lorry = lorries.find((l) => l.id === trip.lorry_id || l.lorry_code === trip.lorry_code);
      if (!lorry) continue;

      const driver = drivers.find((d) => d.id === trip.driver_id || d.assigned_lorry_id === lorry.id || d.id === lorry.driver_id);
      const route = routes.find((r) => r.lorry_id === lorry.id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED');

      const existingShipmentsOnTrip = allShipments.filter(
        (s) => (trip.shipment_ids.includes(s.id) || s.assigned_lorry_id === lorry.id) &&
               s.status !== 'DELIVERED' && s.status !== 'CANCELLED' && s.id !== shipment.id
      );

      const option = evaluateTripConsolidation(shipment, trip, route, lorry, driver, existingShipmentsOnTrip, settings);
      candidateTrips.push(option);
    }

    // 2. Analyze Standby / Available Vehicles for Dedicated Standalone Dispatch
    const candidateNewVehicles: ConsolidationOption[] = [];

    // Filter vehicles that do NOT currently have active heavy routes
    for (const lorry of lorries) {
      const isAlreadyEvaluatedInTrip = candidateTrips.some((c) => c.lorry.id === lorry.id);
      if (isAlreadyEvaluatedInTrip) continue;

      const driver = drivers.find((d) => d.assigned_lorry_id === lorry.id || d.id === lorry.driver_id) ||
        drivers.find((d) => d.availability_status === 'AVAILABLE' || d.availability_status === 'ON_DUTY') ||
        drivers[0];

      const option = evaluateStandaloneNewVehicle(shipment, lorry, driver, settings);
      candidateNewVehicles.push(option);
    }

    // 3. Rank Options
    // Consolidation options are prioritized if feasible and savings > ₹0.
    const allOptions = [...candidateTrips, ...candidateNewVehicles].sort((a, b) => {
      // 1. Feasible options first
      if (a.is_feasible && !b.is_feasible) return -1;
      if (!a.is_feasible && b.is_feasible) return 1;

      // 2. If both feasible, compare net savings and deterministic score
      if (a.is_feasible && b.is_feasible) {
        if (a.is_existing_trip && !b.is_existing_trip && a.net_savings_inr > 400) return -1;
        if (!a.is_existing_trip && b.is_existing_trip && b.net_savings_inr > 400) return 1;
        return b.deterministic_score - a.deterministic_score;
      }

      return b.deterministic_score - a.deterministic_score;
    });

    const recommendedOption = allOptions[0] || candidateNewVehicles[0] || {
      option_id: 'fallback-none',
      decision_type: 'ASSIGN_NEW_VEHICLE' as const,
      lorry: lorries[0],
      driver: drivers[0],
      is_existing_trip: false,
      existing_corridor: 'Standby Allocation',
      new_pickup_city: shipment.pickup_city,
      new_destination_city: shipment.destination_city,
      current_weight_kg: 0,
      new_shipment_weight_kg: shipment.weight_kg,
      projected_weight_kg: shipment.weight_kg,
      max_weight_kg: lorries[0]?.max_weight_kg || 4000,
      current_weight_util_pct: 0,
      projected_weight_util_pct: 50,
      remaining_weight_kg: 2000,
      current_volume_m3: 0,
      new_shipment_volume_m3: shipment.volume_m3,
      projected_volume_m3: shipment.volume_m3,
      max_volume_m3: lorries[0]?.max_volume_m3 || 18,
      current_volume_util_pct: 0,
      projected_volume_util_pct: 50,
      remaining_volume_m3: 9,
      current_route_distance_km: 0,
      projected_route_distance_km: 320,
      additional_distance_km: 320,
      additional_time_minutes: 360,
      pickup_deviation_km: 15,
      corridor_compatibility: 'EXCELLENT' as const,
      fuel_efficiency_km_per_l: 7.0,
      additional_fuel_liters: 45,
      additional_fuel_cost_inr: 4300,
      additional_toll_inr: 700,
      additional_driver_cost_inr: 1800,
      incremental_cost_inr: 7600,
      standalone_new_vehicle_cost_inr: 7600,
      net_savings_inr: 0,
      is_feasible: true,
      is_deadline_feasible: true,
      deadline_buffer_minutes: 45,
      projected_eta: shipment.delivery_deadline,
      delivery_deadline: shipment.delivery_deadline,
      deterministic_score: 85,
      reasons: ['✓ Standby carrier allocated'],
      warning_reasons: [],
      proposed_stops_sequence: [],
    };

    return {
      shipment,
      recommended_option: recommendedOption,
      candidate_trips: candidateTrips,
      candidate_new_vehicles: candidateNewVehicles,
      all_options: allOptions,
      analyzed_at: new Date().toISOString(),
    };
  }
}
