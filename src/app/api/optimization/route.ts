import { NextResponse } from 'next/server';
import { fleetMindStore } from '../../../lib/db/store';
import { runFleetOptimization } from '../../../lib/optimization/optimizer';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const shipments = body.shipments || fleetMindStore.getShipments();
    const lorries = body.lorries || fleetMindStore.getLorries();
    const drivers = body.drivers || fleetMindStore.getDrivers();
    const settings = body.settings || fleetMindStore.getSystemSettings();

    const result = runFleetOptimization(shipments, lorries, drivers, settings);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Optimization failed' },
      { status: 500 }
    );
  }
}
