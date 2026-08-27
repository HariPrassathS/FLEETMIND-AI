import {
  Assignment,
  Driver,
  Lorry,
  OptimizationMetrics,
  OptimizationResult,
  Shipment,
  ShipmentGroup,
  SystemSettings,
  UnassignedReason,
  UnassignedShipmentDiagnosis,
} from './types';
import { groupCompatibleShipments } from './grouping';
import { evaluateLorryForGroup } from './assignment';
import { calculateHaversineDistanceKm } from './routing';
import { calculateTripCost } from './cost';
import { compareCandidates } from './scoring';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: 'sys-settings-default',
  fuel_price_per_liter: 96.5,
  driver_base_rate_per_km: 6.0,
  operating_cost_per_km: 3.2,
  fixed_dispatch_cost_per_lorry: 800.0,
  auto_dispatch_high_priority: false,
  auto_dispatch_critical: true,
  route_deviation_threshold_km: 1.5,
  weight_fuel_cost: 0.35,
  weight_distance: 0.2,
  weight_deadline_risk: 0.25,
  weight_capacity_utilization: 0.15,
  weight_vehicle_reduction: 0.05,
  average_speed_km_per_h: 48,
  loading_time_minutes: 30,
  service_time_per_stop_mins: 20,
  road_distance_factor: 1.28,
  updated_at: new Date().toISOString(),
};

/**
 * Computes Baseline (Un-optimized) Metrics.
 * Baseline assumes 1 shipment per lorry (no consolidation) using standard rates.
 */
function computeBaselineMetrics(
  shipments: Shipment[],
  lorries: Lorry[],
  settings: SystemSettings
): OptimizationMetrics {
  let totalDistance = 0;
  let totalFuel = 0;
  let totalCost = 0;
  let lateCount = 0;
  let totalWeightAssigned = 0;
  let totalLorryCapacity = 0;

  shipments.forEach((s, idx) => {
    const lorry = lorries[idx % Math.max(1, lorries.length)] || lorries[0];
    const dist = calculateHaversineDistanceKm(
      s.pickup_lat,
      s.pickup_lng,
      s.destination_lat,
      s.destination_lng,
      settings.road_distance_factor
    );

    const tripCost = calculateTripCost(
      dist,
      lorry?.fuel_efficiency_km_per_l || 4.2,
      settings
    );

    totalDistance += dist;
    totalFuel += tripCost.fuel_liters;
    totalCost += tripCost.total_cost_inr;
    totalWeightAssigned += s.weight_kg;
    totalLorryCapacity += lorry?.max_weight_kg || 10000;

    // Check SLA
    const estHours = dist / settings.average_speed_km_per_h + 1.0;
    const deadlineHours = Math.max(0.5, (new Date(s.delivery_deadline).getTime() - Date.now()) / (1000 * 3600));
    if (estHours > deadlineHours) lateCount++;
  });

  const utilizedLorries = Math.min(shipments.length, lorries.length || 1);
  const onTimePct = shipments.length > 0 ? ((shipments.length - lateCount) / shipments.length) * 100 : 100;
  const avgUtilization = totalLorryCapacity > 0 ? (totalWeightAssigned / totalLorryCapacity) * 100 : 0;

  return {
    total_lorries_used: utilizedLorries,
    total_distance_km: Math.round(totalDistance),
    total_fuel_liters: Math.round(totalFuel),
    total_cost_inr: Math.round(totalCost),
    late_shipments_count: lateCount,
    on_time_percentage: Number(onTimePct.toFixed(1)),
    avg_capacity_utilization_pct: Number(avgUtilization.toFixed(1)),
  };
}

/**
 * Executes the Fleet Optimization Pipeline.
 */
export function runFleetOptimization(
  shipments: Shipment[],
  lorries: Lorry[],
  drivers: Driver[],
  customSettings?: Partial<SystemSettings>
): OptimizationResult {
  const startTimeMs = performance.now();
  const settings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS, ...customSettings };
  const stepsCompleted: string[] = [];

  // Step 1: Filter Pending & Unassigned Shipments
  const pendingShipments = shipments.filter(
    (s) =>
      s.status === 'PENDING' ||
      s.status === 'UNASSIGNED' ||
      s.status === 'PENDING_DISPATCH' ||
      s.status === 'PENDING_REVIEW' ||
      !s.assigned_lorry_id
  );
  stepsCompleted.push(`Step 1: Loaded ${pendingShipments.length} pending consignments for optimization`);

  // Step 2 & 3: Filter Available Lorries & Drivers
  let availableLorries = lorries.filter(
    (l) => l.status === 'AVAILABLE' || l.status === 'LOADING' || l.status === 'MAINTENANCE' || l.status === 'ON_ROUTE'
  );
  if (availableLorries.length === 0) availableLorries = [...lorries];

  let availableDrivers = drivers.filter(
    (d) => d.availability_status === 'AVAILABLE' || d.availability_status === 'ON_DUTY'
  );
  if (availableDrivers.length === 0) availableDrivers = [...drivers];
  stepsCompleted.push(`Step 2 & 3: Loaded ${availableLorries.length} candidate fleet vehicles & ${availableDrivers.length} pilots`);

  // Compute Baseline Metrics
  const beforeMetrics = computeBaselineMetrics(pendingShipments, availableLorries, settings);

  // Step 4 & 5: Group Compatible Shipments
  const groups: ShipmentGroup[] = groupCompatibleShipments(pendingShipments);
  stepsCompleted.push('Step 4 & 5: Validated constraints and grouped compatible shipments');

  const assignments: Assignment[] = [];
  const unassigned: UnassignedShipmentDiagnosis[] = [];
  const assignedLorryIds = new Set<string>();
  const assignedDriverIds = new Set<string>();

  // Driver lookup map by assigned_lorry_id or general pool
  const driverByLorry = new Map<string, Driver>();
  const unassignedDriversPool: Driver[] = [];

  availableDrivers.forEach((d) => {
    if (d.assigned_lorry_id) {
      driverByLorry.set(d.assigned_lorry_id, d);
    } else {
      unassignedDriversPool.push(d);
    }
  });

  stepsCompleted.push('Step 6 & 7: Candidate generation and multi-objective scoring');

  // Step 8-15: Evaluate and assign groups to best feasible lorries
  for (const group of groups) {
    let bestCandidate: ReturnType<typeof evaluateLorryForGroup> = null;

    // Evaluate all non-assigned available lorries
    for (const lorry of availableLorries) {
      if (assignedLorryIds.has(lorry.id)) continue;

      // Find driver for this lorry
      let driver = driverByLorry.get(lorry.id);
      if (!driver) {
        driver = unassignedDriversPool.find((d) => !assignedDriverIds.has(d.id));
      }

      const evaluation = evaluateLorryForGroup(lorry, driver, group, settings);
      if (evaluation) {
        if (!bestCandidate) {
          bestCandidate = evaluation;
        } else {
          // Deterministic comparison: higher score100 wins, then 7-level tie-breaker
          const cmp = compareCandidates(
            {
              score100: evaluation.score.composite_score,
              isBreached: evaluation.score.deadline_status === 'BREACHED',
              isAtRisk: evaluation.score.deadline_status === 'AT_RISK',
              totalCost: evaluation.score.total_cost_inr,
              fuelLiters: evaluation.score.fuel_consumption_liters,
              utilizationPct: evaluation.score.weight_utilization_pct,
              distanceKm: evaluation.score.total_distance_km,
              lorryId: lorry.id,
            },
            {
              score100: bestCandidate.score.composite_score,
              isBreached: bestCandidate.score.deadline_status === 'BREACHED',
              isAtRisk: bestCandidate.score.deadline_status === 'AT_RISK',
              totalCost: bestCandidate.score.total_cost_inr,
              fuelLiters: bestCandidate.score.fuel_consumption_liters,
              utilizationPct: bestCandidate.score.weight_utilization_pct,
              distanceKm: bestCandidate.score.total_distance_km,
              lorryId: bestCandidate.score.lorry.id,
            }
          );
          if (cmp < 0) bestCandidate = evaluation;
        }
      }
    }

    if (bestCandidate) {
      const selectedLorry = bestCandidate.score.lorry;
      const selectedDriver = bestCandidate.score.driver;

      assignedLorryIds.add(selectedLorry.id);
      if (selectedDriver) {
        assignedDriverIds.add(selectedDriver.id);
      }

      assignments.push({
        lorry_id: selectedLorry.id,
        lorry_code: selectedLorry.lorry_code,
        driver_id: selectedDriver?.id || 'd-generic',
        driver_name: selectedDriver?.name || 'Assigned Driver',
        shipment_ids: group.shipments.map((s) => s.id),
        route: bestCandidate.route,
        score_details: bestCandidate.score,
      });
    } else {
      // Diagnose why this group could not be assigned
      group.shipments.forEach((s) => {
        let reason: UnassignedReason = 'NO_AVAILABLE_LORRY';
        let suggestedAction = 'Deploy additional vehicles from neighboring depot or delay delivery window.';

        const maxFleetCapacity = Math.max(...lorries.map((l) => l.max_weight_kg), 0);
        const maxFleetVol = Math.max(...lorries.map((l) => l.max_volume_m3), 0);

        if (s.weight_kg > maxFleetCapacity) {
          reason = 'INSUFFICIENT_WEIGHT_CAPACITY';
          suggestedAction = 'Split cargo across multiple consignments or assign heavy-duty 28T multi-axle trailer.';
        } else if (s.volume_m3 > maxFleetVol) {
          reason = 'INSUFFICIENT_VOLUME_CAPACITY';
          suggestedAction = 'Use high-cube container vehicle or repack for volume optimization.';
        } else if (availableDrivers.length === 0) {
          reason = 'NO_AVAILABLE_DRIVER';
          suggestedAction = 'Call in reserve drivers or adjust driver shift schedules.';
        } else if (availableLorries.length === 0) {
          reason = 'NO_AVAILABLE_LORRY';
          suggestedAction = 'Wait for on-route vehicles to complete delivery or expedite turnarounds.';
        }

        unassigned.push({
          shipment: s,
          reason,
          required_capacity_kg: s.weight_kg,
          available_capacity_kg: maxFleetCapacity,
          required_volume_m3: s.volume_m3,
          available_volume_m3: maxFleetVol,
          deadline_issue: `Target delivery: ${new Date(s.delivery_deadline).toLocaleString()}`,
          suggested_action: suggestedAction,
        });
      });
    }
  }

  stepsCompleted.push('Step 8-10: Assigned loads, constructed and improved 2-opt routes');
  stepsCompleted.push('Step 11-14: Calculated fuel, dynamic cost, ETAs, and verified deadlines');
  stepsCompleted.push('Step 15: Selected optimal feasible dispatch plan');

  // Compute After (Optimized) Metrics
  const afterDistance = assignments.reduce((s, a) => s + a.route.total_distance_km, 0);
  const afterFuel = assignments.reduce((s, a) => s + a.route.fuel_consumption_liters, 0);
  const afterCost = assignments.reduce((s, a) => s + a.route.estimated_cost, 0);
  const assignedShipmentCount = assignments.reduce((s, a) => s + a.shipment_ids.length, 0);
  
  let lateAfterCount = 0;
  assignments.forEach((a) => {
    if (a.score_details.deadline_status === 'BREACHED') lateAfterCount++;
  });

  const avgWeightUtil = assignments.length > 0
    ? assignments.reduce((s, a) => s + a.score_details.weight_utilization_pct, 0) / assignments.length
    : 0;

  const afterMetrics: OptimizationMetrics = {
    total_lorries_used: assignments.length,
    total_distance_km: Number(afterDistance.toFixed(2)),
    total_fuel_liters: Number(afterFuel.toFixed(2)),
    total_cost_inr: Number(afterCost.toFixed(2)),
    late_shipments_count: lateAfterCount,
    on_time_percentage: assignedShipmentCount > 0 
      ? Number((((assignedShipmentCount - lateAfterCount) / assignedShipmentCount) * 100).toFixed(1)) 
      : 100,
    avg_capacity_utilization_pct: Number(avgWeightUtil.toFixed(1)),
  };

  // Calculate Real Savings
  const costSavingsInr = Math.max(0, beforeMetrics.total_cost_inr - afterMetrics.total_cost_inr);
  const costSavingsPct = beforeMetrics.total_cost_inr > 0 
    ? Number(((costSavingsInr / beforeMetrics.total_cost_inr) * 100).toFixed(1)) 
    : 0;
  
  const fuelSavingsLiters = Math.max(0, beforeMetrics.total_fuel_liters - afterMetrics.total_fuel_liters);
  const fuelSavingsPct = beforeMetrics.total_fuel_liters > 0 
    ? Number(((fuelSavingsLiters / beforeMetrics.total_fuel_liters) * 100).toFixed(1)) 
    : 0;

  const distSavingsKm = Math.max(0, beforeMetrics.total_distance_km - afterMetrics.total_distance_km);
  const distSavingsPct = beforeMetrics.total_distance_km > 0 
    ? Number(((distSavingsKm / beforeMetrics.total_distance_km) * 100).toFixed(1)) 
    : 0;

  const lorriesSaved = Math.max(0, beforeMetrics.total_lorries_used - afterMetrics.total_lorries_used);

  const durationMs = performance.now() - startTimeMs;

  return {
    run_id: `opt-run-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: unassigned.length === 0 ? 'SUCCESS' : assignments.length > 0 ? 'PARTIAL' : 'FAILED',
    before_metrics: beforeMetrics,
    after_metrics: afterMetrics,
    savings: {
      cost_inr: Number(costSavingsInr.toFixed(2)),
      cost_savings_pct: costSavingsPct,
      fuel_liters: Number(fuelSavingsLiters.toFixed(2)),
      fuel_savings_pct: fuelSavingsPct,
      distance_km: Number(distSavingsKm.toFixed(2)),
      distance_savings_pct: distSavingsPct,
      lorries_saved: lorriesSaved,
    },
    assignments,
    unassigned,
    groups,
    steps_completed: stepsCompleted,
    execution_time_ms: Math.round(durationMs),
  };
}
