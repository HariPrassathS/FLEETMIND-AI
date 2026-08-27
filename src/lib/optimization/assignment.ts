import { Driver, Lorry, LorryCandidateScore, Route, RouteStop, ShipmentGroup, SystemSettings } from './types';
import { validateHardConstraints } from './constraints';
import { buildInitialStopsForShipments, calculateHaversineDistanceKm, calculateRouteDistance, optimizeRouteStops } from './routing';
import { calculateTripCost } from './cost';
import { calculateStopETAs, validateRouteDeadlines } from './deadline';
import { calculateCandidateScore, compareCandidates } from './scoring';

export interface EvaluatedCandidate {
  score: LorryCandidateScore;
  route: Route;
}

/**
 * Evaluates a single lorry + driver pairing for a shipment group.
 */
export function evaluateLorryForGroup(
  lorry: Lorry,
  driver: Driver | undefined,
  group: ShipmentGroup,
  settings: SystemSettings,
  startTime: Date = new Date()
): EvaluatedCandidate | null {
  // 1. Hard constraint check
  const constraintCheck = validateHardConstraints(lorry, driver, group.shipments, group.total_weight_kg, group.total_volume_m3);
  if (!constraintCheck.isFeasible) {
    return null;
  }

  const lorryPos = { lat: lorry.current_lat, lng: lorry.current_lng };
  const routeId = `route-${lorry.id}-${Date.now()}`;

  // 2. Build initial stops and improve with 2-opt
  const initialStops = buildInitialStopsForShipments(routeId, group.shipments);
  const optimizedStops = optimizeRouteStops(lorryPos, initialStops, settings.road_distance_factor);

  // 3. Compute deadhead (lorry -> first pickup) and delivery distances
  const deadheadDistKm = calculateHaversineDistanceKm(
    lorryPos.lat,
    lorryPos.lng,
    optimizedStops[0].latitude,
    optimizedStops[0].longitude,
    settings.road_distance_factor
  );

  const totalDistKm = calculateRouteDistance(lorryPos, optimizedStops, settings.road_distance_factor);
  const deliveryDistKm = Number(Math.max(0, totalDistKm - deadheadDistKm).toFixed(2));

  // 4. Cost and Fuel Calculation
  const costBreakdown = calculateTripCost(totalDistKm, lorry.fuel_efficiency_km_per_l, settings);

  // 5. ETA and Deadline Check
  const stopsWithEtas = calculateStopETAs(lorryPos, optimizedStops, startTime, settings);
  const deadlineValidation = validateRouteDeadlines(stopsWithEtas, group.shipments);

  const overallDeadlineStatus = deadlineValidation.breachedCount > 0 
    ? 'BREACHED' 
    : deadlineValidation.atRiskCount > 0 
      ? 'AT_RISK' 
      : 'SAFE';

  // 6. Utilization
  const weightUtilPct = Number(((group.total_weight_kg / lorry.max_weight_kg) * 100).toFixed(1));
  const volumeUtilPct = Number(((group.total_volume_m3 / lorry.max_volume_m3) * 100).toFixed(1));

  // 7. Composite Scoring
  const priorityBonus = group.highest_priority === 'CRITICAL' ? 3 : group.highest_priority === 'HIGH' ? 2 : 1;
  const compositeScore = calculateCandidateScore(
    {
      fuelCostInr: costBreakdown.fuel_cost_inr,
      totalDistanceKm: totalDistKm,
      weightUtilizationPct: weightUtilPct,
      volumeUtilizationPct: volumeUtilPct,
      isAtRisk: overallDeadlineStatus === 'AT_RISK',
      isBreached: overallDeadlineStatus === 'BREACHED',
      priorityBonus,
    },
    settings
  );

  // Estimated Duration in Minutes
  const lastStop = stopsWithEtas[stopsWithEtas.length - 1];
  const lastEta = lastStop ? new Date(lastStop.arrival_eta).getTime() : startTime.getTime();
  const estimatedDurationMins = Math.round((lastEta - startTime.getTime()) / (1000 * 60));

  // Explanation bullet points
  const explanationPoints: string[] = [
    `Vehicle capacity match: ${weightUtilPct}% weight (${group.total_weight_kg}kg / ${lorry.max_weight_kg}kg) and ${volumeUtilPct}% volume.`,
    `Fuel economy: ${lorry.fuel_efficiency_km_per_l} km/L yields total fuel of ${costBreakdown.fuel_liters}L (₹${costBreakdown.fuel_cost_inr.toLocaleString('en-IN')}).`,
    `Deadhead positioning: ${deadheadDistKm} km from initial pickup point.`,
    `Deadline adherence: Classified as ${overallDeadlineStatus} across ${stopsWithEtas.filter(s => s.stop_type === 'DELIVERY').length} deliveries.`,
  ];

  const candidateScore: LorryCandidateScore = {
    lorry,
    driver,
    group,
    deadhead_distance_km: deadheadDistKm,
    delivery_distance_km: deliveryDistKm,
    total_distance_km: totalDistKm,
    fuel_consumption_liters: costBreakdown.fuel_liters,
    fuel_cost_inr: costBreakdown.fuel_cost_inr,
    total_cost_inr: costBreakdown.total_cost_inr,
    weight_utilization_pct: weightUtilPct,
    volume_utilization_pct: volumeUtilPct,
    eta_hours: Number((estimatedDurationMins / 60).toFixed(1)),
    is_deadline_feasible: deadlineValidation.isFeasible,
    deadline_status: overallDeadlineStatus,
    composite_score: compositeScore,
    explanation_points: explanationPoints,
  };

  const route: Route = {
    id: routeId,
    route_code: `RT-${lorry.lorry_code}-${Math.floor(1000 + Math.random() * 9000)}`,
    lorry_id: lorry.id,
    lorry_code: lorry.lorry_code,
    driver_id: driver?.id || 'unassigned-driver',
    driver_name: driver?.name || 'Assigned Driver',
    total_distance_km: totalDistKm,
    estimated_duration_minutes: estimatedDurationMins,
    fuel_consumption_liters: costBreakdown.fuel_liters,
    estimated_cost: costBreakdown.total_cost_inr,
    status: 'PLANNED',
    stops: stopsWithEtas,
    shipment_ids: group.shipments.map((s) => s.id),
    total_weight_kg: group.total_weight_kg,
    total_volume_m3: group.total_volume_m3,
    weight_utilization_pct: weightUtilPct,
    volume_utilization_pct: volumeUtilPct,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    score: candidateScore,
    route,
  };
}
