import { NextResponse } from 'next/server';
import { fleetMindStore } from '../../../lib/db/store';
import { handleDisruption } from '../../../lib/optimization/reoptimizer';
import { DisruptionEvent } from '../../../lib/optimization/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const disruption: DisruptionEvent = body.disruption || {
      id: `disrupt-${Date.now()}`,
      type: 'LORRY_BREAKDOWN',
      severity: 'CRITICAL',
      entity_id: 'L-11',
      title: 'Lorry L-11 Mechanical Breakdown',
      description: 'Vehicle immobilized on highway corridor.',
      timestamp: new Date().toISOString(),
      affected_route_ids: [],
      affected_shipment_ids: [],
      status: 'PENDING_REOPTIMIZATION',
    };

    const routes = fleetMindStore.getRoutes();
    const shipments = fleetMindStore.getShipments();
    const lorries = fleetMindStore.getLorries();
    const drivers = fleetMindStore.getDrivers();
    const settings = fleetMindStore.getSystemSettings();

    const delta = handleDisruption(disruption, routes, shipments, lorries, drivers, settings);
    return NextResponse.json(delta);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Re-optimization failed' },
      { status: 500 }
    );
  }
}
