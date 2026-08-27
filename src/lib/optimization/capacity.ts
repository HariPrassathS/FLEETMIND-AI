import { fleetMindStore } from '../db/store';
import { Lorry, Shipment } from './types';

export interface LorryLiveCapacity {
  lorry: Lorry;
  assignedShipments: Shipment[];
  activeShipmentsCount: number;

  // Total Assigned (Planned + Onboard)
  currentWeightKg: number;
  maxWeightKg: number;
  weightOccupancyPct: number;
  remainingWeightKg: number;

  currentVolumeM3: number;
  maxVolumeM3: number;
  volumeOccupancyPct: number;
  remainingVolumeM3: number;

  // Physically Onboard (Picked Up / In Transit)
  onboardWeightKg: number;
  onboardVolumeM3: number;
  onboardWeightPct: number;
  onboardVolumePct: number;
  hasPlannedPendingPickup: boolean;

  // Status load bucket
  loadStatus: 'EMPTY' | 'LOW' | 'OPTIMAL' | 'HIGH' | 'NEAR_CAPACITY' | 'OVERLOAD';
  statusColor: string; // Tailwind color class / hex
  badgeText: string;
}

export interface ProjectedFitResult {
  isFeasible: boolean;
  weightFeasible: boolean;
  volumeFeasible: boolean;
  projectedWeightKg: number;
  projectedWeightPct: number;
  projectedRemainingWeightKg: number;
  projectedVolumeM3: number;
  projectedVolumePct: number;
  projectedRemainingVolumeM3: number;
  newWeightKg: number;
  newVolumeM3: number;
  errorMessage?: string;
}

/**
 * Calculates realtime live capacity from current store / Supabase state for any lorry.
 */
export function getLorryLiveCapacity(lorryOrId: Lorry | string): LorryLiveCapacity {
  const lorry = typeof lorryOrId === 'string'
    ? fleetMindStore.getLorries().find((l) => l.id === lorryOrId || l.lorry_code === lorryOrId)
    : lorryOrId;

  const maxWeightKg = lorry?.max_weight_kg || 4000;
  const maxVolumeM3 = lorry?.max_volume_m3 || 18;

  if (!lorry) {
    return {
      lorry: {
        id: 'unknown',
        lorry_code: 'L-XX',
        registration_number: 'N/A',
        model: 'Standard Lorry',
        max_weight_kg: maxWeightKg,
        max_volume_m3: maxVolumeM3,
        fuel_efficiency_km_per_l: 7.0,
        current_lat: 13.0827,
        current_lng: 80.2707,
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      assignedShipments: [],
      activeShipmentsCount: 0,
      currentWeightKg: 0,
      maxWeightKg,
      weightOccupancyPct: 0,
      remainingWeightKg: maxWeightKg,
      currentVolumeM3: 0,
      maxVolumeM3,
      volumeOccupancyPct: 0,
      remainingVolumeM3: maxVolumeM3,
      onboardWeightKg: 0,
      onboardVolumeM3: 0,
      onboardWeightPct: 0,
      onboardVolumePct: 0,
      hasPlannedPendingPickup: false,
      loadStatus: 'EMPTY',
      statusColor: '#10b981',
      badgeText: '0% LOADED (EMPTY)',
    };
  }

  // Active non-delivered shipments assigned to this vehicle
  const allShipments = fleetMindStore.getShipments();
  const assignedShipments = allShipments.filter(
    (s) =>
      s.assigned_lorry_id === lorry.id &&
      s.status !== 'DELIVERED' &&
      s.status !== 'CANCELLED' &&
      s.status !== 'REJECTED'
  );

  const currentWeightKg = assignedShipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0);
  const currentVolumeM3 = Number(assignedShipments.reduce((sum, s) => sum + (s.volume_m3 || 0), 0).toFixed(1));

  const weightOccupancyPct = Math.round((currentWeightKg / maxWeightKg) * 100);
  const volumeOccupancyPct = Math.round((currentVolumeM3 / maxVolumeM3) * 100);

  const remainingWeightKg = Math.max(0, maxWeightKg - currentWeightKg);
  const remainingVolumeM3 = Math.max(0, Number((maxVolumeM3 - currentVolumeM3).toFixed(1)));

  // Onboard physically confirmed (picked up / in transit)
  const onboardShipments = assignedShipments.filter(
    (s) =>
      s.status === 'PICKED_UP' ||
      s.status === 'IN_TRANSIT' ||
      s.status === 'DISPATCHED' ||
      s.status === 'ARRIVED_DESTINATION' ||
      s.status === 'ARRIVED' ||
      s.status === 'OUT_FOR_DELIVERY' ||
      s.status === 'DELIVERY_VERIFICATION'
  );

  const onboardWeightKg = onboardShipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0);
  const onboardVolumeM3 = Number(onboardShipments.reduce((sum, s) => sum + (s.volume_m3 || 0), 0).toFixed(1));

  const onboardWeightPct = Math.round((onboardWeightKg / maxWeightKg) * 100);
  const onboardVolumePct = Math.round((onboardVolumeM3 / maxVolumeM3) * 100);

  const hasPlannedPendingPickup = assignedShipments.some(
    (s) => s.status === 'ASSIGNED' || s.status === 'PICKUP_SCHEDULED' || s.status === 'EN_ROUTE_TO_PICKUP' || s.status === 'ARRIVED_PICKUP'
  );

  // Status Load Classification (Based on the larger of weight or volume utilization)
  const maxOccupancy = Math.max(weightOccupancyPct, volumeOccupancyPct);

  let loadStatus: LorryLiveCapacity['loadStatus'] = 'EMPTY';
  let statusColor = '#10b981'; // Emerald
  let badgeText = '0% LOADED';

  if (maxOccupancy > 100) {
    loadStatus = 'OVERLOAD';
    statusColor = '#ef4444'; // Red
    badgeText = `${maxOccupancy}% OVERLOADED`;
  } else if (maxOccupancy >= 95) {
    loadStatus = 'NEAR_CAPACITY';
    statusColor = '#f43f5e'; // Rose
    badgeText = `${maxOccupancy}% NEAR CAPACITY`;
  } else if (maxOccupancy >= 80) {
    loadStatus = 'HIGH';
    statusColor = '#f59e0b'; // Amber
    badgeText = `${maxOccupancy}% HIGH LOAD`;
  } else if (maxOccupancy >= 50) {
    loadStatus = 'OPTIMAL';
    statusColor = '#3b82f6'; // Blue
    badgeText = `${maxOccupancy}% OPTIMAL LOAD`;
  } else if (maxOccupancy > 0) {
    loadStatus = 'LOW';
    statusColor = '#10b981'; // Emerald
    badgeText = `${maxOccupancy}% LOADED`;
  } else {
    loadStatus = 'EMPTY';
    statusColor = '#64748b'; // Slate
    badgeText = 'EMPTY (0%)';
  }

  return {
    lorry,
    assignedShipments,
    activeShipmentsCount: assignedShipments.length,
    currentWeightKg,
    maxWeightKg,
    weightOccupancyPct,
    remainingWeightKg,
    currentVolumeM3,
    maxVolumeM3,
    volumeOccupancyPct,
    remainingVolumeM3,
    onboardWeightKg,
    onboardVolumeM3,
    onboardWeightPct,
    onboardVolumePct,
    hasPlannedPendingPickup,
    loadStatus,
    statusColor,
    badgeText,
  };
}

/**
 * Calculates what the projected vehicle capacity will be if a new shipment is assigned.
 */
export function calculateProjectedFit(
  capacity: LorryLiveCapacity,
  newShipment: { weight_kg: number; volume_m3: number }
): ProjectedFitResult {
  const projectedWeightKg = capacity.currentWeightKg + newShipment.weight_kg;
  const projectedVolumeM3 = Number((capacity.currentVolumeM3 + newShipment.volume_m3).toFixed(1));

  const weightFeasible = projectedWeightKg <= capacity.maxWeightKg;
  const volumeFeasible = projectedVolumeM3 <= capacity.maxVolumeM3;
  const isFeasible = weightFeasible && volumeFeasible;

  const projectedWeightPct = Math.round((projectedWeightKg / capacity.maxWeightKg) * 100);
  const projectedVolumePct = Math.round((projectedVolumeM3 / capacity.maxVolumeM3) * 100);

  const projectedRemainingWeightKg = Math.max(0, capacity.maxWeightKg - projectedWeightKg);
  const projectedRemainingVolumeM3 = Math.max(0, Number((capacity.maxVolumeM3 - projectedVolumeM3).toFixed(1)));

  let errorMessage: string | undefined;
  if (!weightFeasible && !volumeFeasible) {
    errorMessage = '✕ WEIGHT & VOLUME CAPACITY EXCEEDED';
  } else if (!weightFeasible) {
    errorMessage = `✕ WEIGHT CAPACITY EXCEEDED (+${projectedWeightKg - capacity.maxWeightKg} kg over)`;
  } else if (!volumeFeasible) {
    errorMessage = `✕ VOLUME CAPACITY EXCEEDED (+${Number((projectedVolumeM3 - capacity.maxVolumeM3).toFixed(1))} m³ over)`;
  }

  return {
    isFeasible,
    weightFeasible,
    volumeFeasible,
    projectedWeightKg,
    projectedWeightPct,
    projectedRemainingWeightKg,
    projectedVolumeM3,
    projectedVolumePct,
    projectedRemainingVolumeM3,
    newWeightKg: newShipment.weight_kg,
    newVolumeM3: newShipment.volume_m3,
    errorMessage,
  };
}
