import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyRoutePlanner } from '../../../../lib/routing/geoapify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agents = body.agents || [];
    const jobs = body.jobs || [];

    if (!agents.length || !jobs.length) {
      return NextResponse.json({ error: 'agents and jobs arrays are required' }, { status: 400 });
    }

    const solution = await fetchGeoapifyRoutePlanner(agents, jobs);
    if (solution) {
      return NextResponse.json({
        success: true,
        solution,
        engine: 'geoapify_routeplanner',
      });
    }

    return NextResponse.json({ error: 'Failed to solve vehicle routing problem' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Route planner failed' }, { status: 500 });
  }
}
