import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyRouteMatrix } from '../../../../lib/routing/geoapify';
import type { LngLat } from '../../../../lib/routing/types';
import { calculateDistance } from '../../../../lib/routing/routing-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sources: LngLat[] = body.sources || [];
    const targets: LngLat[] = body.targets || [];

    if (!sources.length || !targets.length) {
      return NextResponse.json({ error: 'sources and targets arrays are required' }, { status: 400 });
    }

    // Try Geoapify Route Matrix API
    const matrix = await fetchGeoapifyRouteMatrix(sources, targets);
    if (matrix) {
      return NextResponse.json({
        matrix,
        source: 'geoapify',
      });
    }

    // Fallback: Haversine distance matrix
    const fallbackMatrix = sources.map(([srcLng, srcLat]) =>
      targets.map(([tgtLng, tgtLat]) => {
        const distKm = calculateDistance(srcLat, srcLng, tgtLat, tgtLng);
        return {
          distance_meters: Math.round(distKm * 1000),
          time_seconds: Math.round((distKm / 50) * 3600),
        };
      })
    );

    return NextResponse.json({
      matrix: fallbackMatrix,
      source: 'haversine_fallback',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Matrix calculation failed' }, { status: 500 });
  }
}
