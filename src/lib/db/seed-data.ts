import { Driver, Lorry, Shipment, SystemSettings } from '../optimization/types';

export const SEED_SYSTEM_SETTINGS: SystemSettings = {
  id: 'sys-settings-01',
  fuel_price_per_liter: 96.50, // ₹96.50 / Liter (Standard Indian Commercial Diesel)
  driver_base_rate_per_km: 6.00, // ₹6.00 / km
  operating_cost_per_km: 3.20, // ₹3.20 / km (tires, mechanical maintenance & lubricants)
  fixed_dispatch_cost_per_lorry: 800.00, // ₹800 fixed dispatch overhead
  auto_dispatch_high_priority: false, // Configurable operational auto-dispatch
  route_deviation_threshold_km: 1.5, // 1.5 km corridor deviation alert limit
  weight_fuel_cost: 0.35,
  weight_distance: 0.20,
  weight_deadline_risk: 0.25,
  weight_capacity_utilization: 0.15,
  weight_vehicle_reduction: 0.05,
  average_speed_km_per_h: 48,
  loading_time_minutes: 30,
  service_time_per_stop_mins: 20,
  road_distance_factor: 1.28,
  updated_at: new Date().toISOString(),
};

// Clean Production Initial Arrays
export const SEED_LORRIES: Lorry[] = [];
export const SEED_DRIVERS: Driver[] = [];
export const SEED_SHIPMENTS: Shipment[] = [];
