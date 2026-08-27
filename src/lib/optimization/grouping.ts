import { Shipment, ShipmentGroup, ShipmentPriority } from './types';
import { calculateHaversineDistanceKm } from './routing';

/**
 * Priority rank helper for group sorting
 */
const PRIORITY_ORDER: Record<ShipmentPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Identifies compatible shipments and aggregates them into consolidated groups.
 * Criteria:
 * 1. Geographic destination proximity (within ~65km or same destination city)
 * 2. Pickup proximity (within ~50km)
 * 3. Cargo compatibility (Hazardous items not mixed with perishable/food)
 * 4. Max weight & volume limits (configurable max ~18,000 kg and ~45 m³)
 */
export function groupCompatibleShipments(
  pendingShipments: Shipment[],
  maxGroupWeightKg: number = 18000,
  maxGroupVolumeM3: number = 42
): ShipmentGroup[] {
  const unassigned = [...pendingShipments].sort(
    (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
  );

  const groups: ShipmentGroup[] = [];
  let groupIndex = 1;

  while (unassigned.length > 0) {
    const seed = unassigned.shift()!;
    const currentGroupShipments: Shipment[] = [seed];
    let currentWeight = seed.weight_kg;
    let currentVolume = seed.volume_m3;
    let highestPriority = seed.priority;
    let earliestDeadline = seed.delivery_deadline;

    // Scan remaining shipments to find compatible candidates
    let i = 0;
    while (i < unassigned.length) {
      const candidate = unassigned[i];

      // Check cargo compatibility
      const isHazmatConflict = 
        (seed.category === 'HAZARDOUS' && candidate.category !== 'HAZARDOUS') ||
        (candidate.category === 'HAZARDOUS' && seed.category !== 'HAZARDOUS');

      // Check destination proximity
      const destDistKm = calculateHaversineDistanceKm(
        seed.destination_lat,
        seed.destination_lng,
        candidate.destination_lat,
        candidate.destination_lng
      );
      const sameCity = seed.destination_city.toLowerCase() === candidate.destination_city.toLowerCase();
      const isDestCompatible = sameCity || destDistKm <= 65;

      // Check pickup proximity
      const pickupDistKm = calculateHaversineDistanceKm(
        seed.pickup_lat,
        seed.pickup_lng,
        candidate.pickup_lat,
        candidate.pickup_lng
      );
      const isPickupCompatible = pickupDistKm <= 55;

      // Check cumulative capacity
      const fitsWeight = currentWeight + candidate.weight_kg <= maxGroupWeightKg;
      const fitsVolume = currentVolume + candidate.volume_m3 <= maxGroupVolumeM3;

      if (!isHazmatConflict && isDestCompatible && isPickupCompatible && fitsWeight && fitsVolume) {
        currentGroupShipments.push(candidate);
        currentWeight += candidate.weight_kg;
        currentVolume += candidate.volume_m3;

        if (PRIORITY_ORDER[candidate.priority] > PRIORITY_ORDER[highestPriority]) {
          highestPriority = candidate.priority;
        }
        if (new Date(candidate.delivery_deadline) < new Date(earliestDeadline)) {
          earliestDeadline = candidate.delivery_deadline;
        }

        unassigned.splice(i, 1);
      } else {
        i++;
      }
    }

    const corridorName = currentGroupShipments.length > 1
      ? `${seed.pickup_city} → ${seed.destination_city} (Consolidated)`
      : `${seed.pickup_city} → ${seed.destination_city}`;

    groups.push({
      id: `group-${groupIndex}`,
      group_code: `G-${String(groupIndex).padStart(2, '0')}`,
      shipments: currentGroupShipments,
      total_weight_kg: currentWeight,
      total_volume_m3: Number(currentVolume.toFixed(2)),
      destination_corridor: corridorName,
      earliest_deadline: earliestDeadline,
      highest_priority: highestPriority,
    });

    groupIndex++;
  }

  return groups;
}
