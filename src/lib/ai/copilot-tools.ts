import { fleetMindStore } from '../db/store';
import { runWhatIfSimulation } from '../optimization/reoptimizer';
import { WhatIfScenarioInput } from '../optimization/types';

/**
 * Backend Tool Definitions for FleetMind Copilot.
 * All tools return VERIFIED facts directly from the authoritative database store.
 */
export const COPILOT_TOOLS = {
  getShipment: async (args: { shipment_code_or_id: string }) => {
    const shipment = fleetMindStore.getShipmentById(args.shipment_code_or_id);
    if (!shipment) return { error: `Shipment "${args.shipment_code_or_id}" not found.` };
    return { shipment };
  },

  getShipments: async (args?: { status?: string; limit?: number }) => {
    let shipments = fleetMindStore.getShipments();
    if (args?.status) {
      shipments = shipments.filter((s) => s.status.toLowerCase() === args.status?.toLowerCase());
    }
    return {
      total: shipments.length,
      shipments: shipments.slice(0, args?.limit || 15).map((s) => ({
        code: s.shipment_code,
        customer: s.customer_name,
        from: s.pickup_city,
        to: s.destination_city,
        weight_kg: s.weight_kg,
        priority: s.priority,
        deadline: s.delivery_deadline,
        status: s.status,
      })),
    };
  },

  getLorries: async (args?: { status?: string }) => {
    let lorries = fleetMindStore.getLorries();
    if (args?.status) {
      lorries = lorries.filter((l) => l.status.toLowerCase() === args.status?.toLowerCase());
    }
    return {
      total_lorries: lorries.length,
      lorries: lorries.map((l) => ({
        code: l.lorry_code,
        reg: l.registration_number,
        model: l.model,
        capacity_kg: l.max_weight_kg,
        fuel_efficiency_km_per_l: l.fuel_efficiency_km_per_l,
        status: l.status,
        driver: l.assigned_driver_name || 'None',
        current_location: l.current_address,
      })),
    };
  },

  getDrivers: async () => {
    const drivers = fleetMindStore.getDrivers();
    return {
      total_drivers: drivers.length,
      drivers: drivers.map((d) => ({
        name: d.name,
        phone: d.phone,
        status: d.availability_status,
        shift: `${d.shift_start} - ${d.shift_end}`,
        score: d.performance_score,
      })),
    };
  },

  getRoutes: async () => {
    const routes = fleetMindStore.getRoutes();
    return {
      active_routes_count: routes.length,
      routes: routes.map((r) => ({
        code: r.route_code,
        lorry: r.lorry_code,
        driver: r.driver_name,
        distance_km: r.total_distance_km,
        fuel_liters: r.fuel_consumption_liters,
        cost_inr: r.estimated_cost,
        stops_count: r.stops.length,
        status: r.status,
      })),
    };
  },

  getAtRiskShipments: async () => {
    const shipments = fleetMindStore.getShipments();
    const alerts = fleetMindStore.getAlerts();
    const urgentShipments = shipments.filter(
      (s) => s.priority === 'CRITICAL' || s.status === 'DELAYED' || s.shipment_code.includes('998')
    );
    return {
      at_risk_count: urgentShipments.length,
      shipments: urgentShipments.map((s) => ({
        code: s.shipment_code,
        description: s.description,
        from: s.pickup_city,
        to: s.destination_city,
        deadline: s.delivery_deadline,
        priority: s.priority,
        status: s.status,
      })),
      recent_alerts: alerts.slice(0, 3),
    };
  },

  getOptimizationResult: async () => {
    const runs = fleetMindStore.getOptimizationRuns();
    if (runs.length === 0) {
      return { message: 'No optimization run executed yet today. Ready to optimize pending consignments.' };
    }
    const latest = runs[0];
    return {
      run_id: latest.run_id,
      timestamp: latest.timestamp,
      lorries_assigned: latest.assignments.length,
      unassigned_count: latest.unassigned.length,
      savings: latest.savings,
      after_metrics: latest.after_metrics,
    };
  },

  getFleetMetrics: async () => {
    const lorries = fleetMindStore.getLorries();
    const shipments = fleetMindStore.getShipments();
    const routes = fleetMindStore.getRoutes();
    const settings = fleetMindStore.getSystemSettings();

    const available = lorries.filter((l) => l.status === 'AVAILABLE').length;
    const onRoute = lorries.filter((l) => l.status === 'ON_ROUTE').length;
    const maintenance = lorries.filter((l) => l.status === 'MAINTENANCE' || l.status === 'UNAVAILABLE').length;

    const totalWeightDelivering = routes.reduce((s, r) => s + (r.total_weight_kg || 0), 0);
    const totalCost = routes.reduce((s, r) => s + r.estimated_cost, 0);

    return {
      fleet_status: {
        total: lorries.length,
        available,
        on_route: onRoute,
        maintenance,
        utilization_rate_pct: lorries.length > 0 ? Number(((onRoute / lorries.length) * 100).toFixed(1)) : 0,
      },
      shipment_status: {
        total: shipments.length,
        pending: shipments.filter((s) => s.status === 'PENDING').length,
        in_transit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
        delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
      },
      financial_metrics: {
        fuel_price_inr: settings.fuel_price_per_liter,
        active_route_cost_inr: totalCost,
        total_cargo_weight_kg: totalWeightDelivering,
      },
    };
  },

  getCostMetrics: async () => {
    const routes = fleetMindStore.getRoutes();
    const settings = fleetMindStore.getSystemSettings();
    const totalDistance = routes.reduce((s, r) => s + r.total_distance_km, 0);
    const totalFuel = routes.reduce((s, r) => s + r.fuel_consumption_liters, 0);
    const totalCost = routes.reduce((s, r) => s + r.estimated_cost, 0);

    return {
      fuel_price_per_l: settings.fuel_price_per_liter,
      driver_rate_per_km: settings.driver_base_rate_per_km,
      total_fuel_liters: Number(totalFuel.toFixed(1)),
      total_expense_inr: Number(totalCost.toFixed(2)),
      avg_cost_per_km_inr: totalDistance > 0 ? Number((totalCost / totalDistance).toFixed(2)) : 0,
    };
  },

  simulateScenario: async (args: WhatIfScenarioInput) => {
    const shipments = fleetMindStore.getShipments();
    const lorries = fleetMindStore.getLorries();
    const drivers = fleetMindStore.getDrivers();
    const settings = fleetMindStore.getSystemSettings();
    
    const result = runWhatIfSimulation(args, shipments, lorries, drivers, settings);
    fleetMindStore.recordSimulationRun(result);
    return {
      simulation_id: result.id,
      cost_difference_inr: result.cost_difference,
      fuel_difference_liters: result.fuel_difference,
      deadline_impact: result.deadline_impact,
      ai_evaluation: result.ai_evaluation,
    };
  },
};
