import { NextResponse } from 'next/server';
import { fleetMindStore } from '../../../lib/db/store';
import { runWhatIfSimulation } from '../../../lib/optimization/reoptimizer';
import { WhatIfScenarioInput } from '../../../lib/optimization/types';

export async function POST(request: Request) {
  try {
    const scenario: WhatIfScenarioInput = await request.json();
    const shipments = fleetMindStore.getShipments();
    const lorries = fleetMindStore.getLorries();
    const drivers = fleetMindStore.getDrivers();
    const settings = fleetMindStore.getSystemSettings();

    const result = runWhatIfSimulation(scenario, shipments, lorries, drivers, settings);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Simulation failed' },
      { status: 500 }
    );
  }
}
