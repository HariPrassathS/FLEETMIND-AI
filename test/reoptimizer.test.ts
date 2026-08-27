import { describe, it, expect } from 'vitest';
import { handleDisruption, runWhatIfSimulation } from '../src/lib/optimization/reoptimizer';
import { SEED_LORRIES, SEED_DRIVERS, SEED_SHIPMENTS, SEED_SYSTEM_SETTINGS } from '../src/lib/db/seed-data';
import { fleetMindStore } from '../src/lib/db/store';
import { DisruptionEvent } from '../src/lib/optimization/types';

describe('Disruption & Re-optimization Engine Tests', () => {
  it('should isolate affected consignments and generate delta plan during lorry breakdown', () => {
    const routes = fleetMindStore.getRoutes();
    const disruption: DisruptionEvent = {
      id: 'disrupt-test',
      type: 'LORRY_BREAKDOWN',
      severity: 'CRITICAL',
      entity_id: 'L-11',
      title: 'L-11 Engine Failure',
      description: 'NH48 highway breakdown',
      timestamp: new Date().toISOString(),
      affected_route_ids: [],
      affected_shipment_ids: [],
      status: 'PENDING_REOPTIMIZATION',
    };

    const delta = handleDisruption(
      disruption,
      routes,
      SEED_SHIPMENTS,
      SEED_LORRIES,
      SEED_DRIVERS,
      SEED_SYSTEM_SETTINGS
    );

    expect(delta).toBeDefined();
    expect(delta.original_plan).toBeDefined();
    expect(delta.new_plan).toBeDefined();
    expect(delta.diff.sla_impact).toBeDefined();
    expect(delta.recommended_actions.length).toBeGreaterThan(0);
  });

  it('should run non-destructive What-If simulations', () => {
    const simResult = runWhatIfSimulation(
      {
        scenario_type: 'FUEL_PRICE_SPIKE',
        fuel_price_delta: 20.0,
      },
      SEED_SHIPMENTS,
      SEED_LORRIES,
      SEED_DRIVERS,
      SEED_SYSTEM_SETTINGS
    );

    expect(simResult.id).toBeDefined();
    expect(simResult.cost_difference).toBeGreaterThan(0); // Price spike causes cost increase
    expect(simResult.ai_evaluation).toBeDefined();
  });
});
