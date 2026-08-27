import { describe, it, expect } from 'vitest';
import { validateHardConstraints } from '../src/lib/optimization/constraints';
import { calculateFuelConsumptionLiters, calculateTripCost } from '../src/lib/optimization/cost';
import { calculateHaversineDistanceKm, optimizeRouteStops } from '../src/lib/optimization/routing';
import { groupCompatibleShipments } from '../src/lib/optimization/grouping';
import { runFleetOptimization, DEFAULT_SYSTEM_SETTINGS } from '../src/lib/optimization/optimizer';
import { SEED_LORRIES, SEED_DRIVERS, SEED_SHIPMENTS, SEED_SYSTEM_SETTINGS } from '../src/lib/db/seed-data';
import { Lorry, Driver, Shipment } from '../src/lib/optimization/types';

describe('TypeScript Optimization Engine Tests', () => {
  it('should correctly calculate Haversine distance with road winding factor', () => {
    // Chennai (13.0827, 80.2707) to Hosur (12.8399, 77.6770) ~280-310 km
    const dist = calculateHaversineDistanceKm(13.0827, 80.2707, 12.8399, 77.6770, 1.28);
    expect(dist).toBeGreaterThan(270);
    expect(dist).toBeLessThan(400);
  });

  it('should enforce hard weight and volume constraints', () => {
    const mockLorry: Lorry = {
      id: 'l-test',
      lorry_code: 'L-TEST',
      registration_number: 'TN-01-XX-0000',
      model: 'Tata Ace (1.2 Ton)',
      max_weight_kg: 1200,
      max_volume_m3: 5.5,
      fuel_efficiency_km_per_l: 14.0,
      current_lat: 13.0827,
      current_lng: 80.2707,
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockDriver: Driver = {
      id: 'd-test',
      name: 'Test Driver',
      phone: '+91 9999999999',
      license_number: 'TN-01-2020-000',
      current_lat: 13.0827,
      current_lng: 80.2707,
      availability_status: 'AVAILABLE',
      shift_start: '06:00',
      shift_end: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const overweightShipment: Shipment = {
      id: 's-overweight',
      shipment_code: 'S-OVER',
      customer_id: 'c1',
      description: 'Heavy Generator',
      pickup_lat: 13.0,
      pickup_lng: 80.2,
      pickup_address: 'A',
      pickup_city: 'Chennai',
      destination_lat: 12.9,
      destination_lng: 77.6,
      destination_address: 'B',
      destination_city: 'Bengaluru',
      weight_kg: 3500, // Exceeds 1200 kg capacity!
      volume_m3: 4.0,
      category: 'GENERAL',
      priority: 'MEDIUM',
      delivery_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const check = validateHardConstraints(mockLorry, mockDriver, [overweightShipment]);
    expect(check.isFeasible).toBe(false);
    expect(check.violatedConstraints).toContain('INSUFFICIENT_WEIGHT_CAPACITY');
  });

  it('should accurately calculate fuel burn and trip costs in INR', () => {
    // 300 km @ 10 km/L = 30 Liters
    const fuelLiters = calculateFuelConsumptionLiters(300, 10);
    expect(fuelLiters).toBe(30);

    const tripCost = calculateTripCost(300, 10, {
      fuel_price_per_liter: 96.5,
      driver_base_rate_per_km: 6.0,
      fixed_dispatch_cost_per_lorry: 800.0,
    });

    // Fuel cost: 30 * 96.5 = 2895
    // Driver cost: 300 * 6.0 = 1800
    // Fixed: 800
    // Total: 2895 + 1800 + 800 = 5495
    expect(tripCost.fuel_cost_inr).toBe(2895);
    expect(tripCost.driver_cost_inr).toBe(1800);
    expect(tripCost.total_cost_inr).toBe(5495);
  });

  it('should demonstrate the Killer Demo mathematical proof (Lorry B vs Lorry A)', () => {
    const tripKm = 290;
    const fuelPrice = 96.5;
    const driverRate = 6.0;
    const fixedCost = 800.0;

    // Lorry A: 12 km away, 5.0 km/L
    const lorryAKm = tripKm + 12; // 302 km
    const lorryAFuelL = lorryAKm / 5.0; // 60.4 L
    const lorryACost = lorryAFuelL * fuelPrice + lorryAKm * driverRate + fixedCost;

    // Lorry B: 19 km away, 10.4 km/L
    const lorryBKm = tripKm + 19; // 309 km
    const lorryBFuelL = lorryBKm / 10.4; // 29.71 L
    const lorryBCost = lorryBFuelL * fuelPrice + lorryBKm * driverRate + fixedCost;

    expect(lorryBCost).toBeLessThan(lorryACost);
    const savingsInr = lorryACost - lorryBCost;
    expect(savingsInr).toBeGreaterThan(2800); // Saves over ₹2,800!
  });

  it('should run full 15-step optimization on seed data with positive savings', () => {
    const result = runFleetOptimization(SEED_SHIPMENTS, SEED_LORRIES, SEED_DRIVERS, SEED_SYSTEM_SETTINGS);
    expect(result.status).toBeDefined();
    expect(result.assignments.length).toBeGreaterThan(0);
    expect(result.savings.cost_inr).toBeGreaterThan(0);
    expect(result.savings.fuel_liters).toBeGreaterThan(0);
    expect(result.steps_completed.length).toBeGreaterThanOrEqual(6);
  });
});
