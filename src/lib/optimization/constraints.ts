import { Driver, Lorry, Shipment, UnassignedReason } from './types';

export interface ConstraintCheckResult {
  isFeasible: boolean;
  violatedConstraints: UnassignedReason[];
  reasons: string[];
}

/**
 * Validates hard constraints for assigning a single shipment or group to a specific lorry & driver.
 */
export function validateHardConstraints(
  lorry: Lorry,
  driver: Driver | null | undefined,
  shipments: Shipment[],
  totalGroupWeightKg?: number,
  totalGroupVolumeM3?: number
): ConstraintCheckResult {
  const violatedConstraints: UnassignedReason[] = [];
  const reasons: string[] = [];

  const requiredWeight = totalGroupWeightKg ?? shipments.reduce((sum, s) => sum + s.weight_kg, 0);
  const requiredVolume = totalGroupVolumeM3 ?? shipments.reduce((sum, s) => sum + s.volume_m3, 0);

  // 1. Lorry status check
  if (lorry.status !== 'AVAILABLE' && lorry.status !== 'LOADING') {
    violatedConstraints.push('NO_AVAILABLE_LORRY');
    reasons.push(`Lorry ${lorry.lorry_code} is currently ${lorry.status} and cannot take new assignments.`);
  }

  // 2. Weight capacity constraint
  if (requiredWeight > lorry.max_weight_kg) {
    violatedConstraints.push('INSUFFICIENT_WEIGHT_CAPACITY');
    reasons.push(
      `Required weight (${requiredWeight.toLocaleString()} kg) exceeds lorry capacity (${lorry.max_weight_kg.toLocaleString()} kg).`
    );
  }

  // 3. Volume capacity constraint
  if (requiredVolume > lorry.max_volume_m3) {
    violatedConstraints.push('INSUFFICIENT_VOLUME_CAPACITY');
    reasons.push(
      `Required volume (${requiredVolume.toFixed(1)} m³) exceeds lorry volume limit (${lorry.max_volume_m3.toFixed(1)} m³).`
    );
  }

  // 4. Driver availability check
  if (!driver || (driver.availability_status !== 'AVAILABLE' && driver.availability_status !== 'ON_DUTY')) {
    violatedConstraints.push('NO_AVAILABLE_DRIVER');
    reasons.push(
      driver 
        ? `Assigned driver ${driver.name} is ${driver.availability_status}.`
        : `No active driver assigned to lorry ${lorry.lorry_code}.`
    );
  }

  // 5. Refrigeration / Category check
  const requiresRefrigeration = shipments.some((s) => s.category === 'PERISHABLE');
  if (requiresRefrigeration && !lorry.is_refrigerated) {
    violatedConstraints.push('NO_COMPATIBLE_ROUTE');
    reasons.push(`Shipment contains perishable cargo requiring a refrigerated container.`);
  }

  return {
    isFeasible: violatedConstraints.length === 0,
    violatedConstraints,
    reasons,
  };
}
