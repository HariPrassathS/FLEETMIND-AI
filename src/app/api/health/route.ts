import { NextResponse } from 'next/server';
import { fleetMindStore } from '../../../lib/db/store';

export async function GET() {
  const health = fleetMindStore.getSystemHealth();
  return NextResponse.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    services: health,
  });
}
