import { SystemSettings } from './types';

export interface CostBreakdown {
  fuel_liters: number;
  fuel_cost_inr: number;
  driver_cost_inr: number;
  fixed_dispatch_cost_inr: number;
  total_cost_inr: number;
  cost_per_km_inr: number;
}

/**
 * Computes fuel consumed in Liters:
 * fuel_liters = distance_km / fuel_efficiency_km_per_l
 */
export function calculateFuelConsumptionLiters(
  distanceKm: number,
  fuelEfficiencyKmPerL: number
): number {
  if (fuelEfficiencyKmPerL <= 0) return 0;
  return Number((distanceKm / fuelEfficiencyKmPerL).toFixed(2));
}

/**
 * Calculates complete trip cost based on dynamic fuel price and system settings.
 */
export function calculateTripCost(
  distanceKm: number,
  fuelEfficiencyKmPerL: number,
  settings: Pick<SystemSettings, 'fuel_price_per_liter' | 'driver_base_rate_per_km' | 'fixed_dispatch_cost_per_lorry'>
): CostBreakdown {
  const fuelLiters = calculateFuelConsumptionLiters(distanceKm, fuelEfficiencyKmPerL);
  const fuelCostInr = Number((fuelLiters * settings.fuel_price_per_liter).toFixed(2));
  const driverCostInr = Number((distanceKm * settings.driver_base_rate_per_km).toFixed(2));
  const fixedCostInr = settings.fixed_dispatch_cost_per_lorry;
  const totalCostInr = Number((fuelCostInr + driverCostInr + fixedCostInr).toFixed(2));
  const costPerKm = distanceKm > 0 ? Number((totalCostInr / distanceKm).toFixed(2)) : 0;

  return {
    fuel_liters: fuelLiters,
    fuel_cost_inr: fuelCostInr,
    driver_cost_inr: driverCostInr,
    fixed_dispatch_cost_inr: fixedCostInr,
    total_cost_inr: totalCostInr,
    cost_per_km_inr: costPerKm,
  };
}
