import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddressWithGeoapify } from '../../../../lib/routing/geoapify';
import { resolveCityCoordinates } from '../../../../lib/routing/city-coordinates';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || searchParams.get('query');

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Text query is required' }, { status: 400 });
  }

  // 1. Try local city registry
  const localMatch = resolveCityCoordinates(text);

  // 2. Query Geoapify Geocoding
  try {
    const geoapifyResult = await geocodeAddressWithGeoapify(text);
    if (geoapifyResult) {
      return NextResponse.json({
        lat: geoapifyResult.lat,
        lng: geoapifyResult.lng,
        formattedAddress: geoapifyResult.formattedAddress,
        city: geoapifyResult.city || localMatch.cityName,
        state: geoapifyResult.state,
        country: geoapifyResult.country,
        source: 'geoapify',
      });
    }
  } catch (err) {
    console.warn('[/api/geocoding/search] Geoapify search error:', err);
  }

  // 3. Fallback to local coordinate registry
  return NextResponse.json({
    lat: localMatch.lat,
    lng: localMatch.lng,
    formattedAddress: localMatch.cityName,
    city: localMatch.cityName,
    source: 'local_registry',
  });
}
