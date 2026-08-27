import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoapifyIPInfo } from '../../../../lib/routing/geoapify';

export async function GET(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

    const info = await fetchGeoapifyIPInfo(realIp);
    if (info) {
      return NextResponse.json({
        success: true,
        ...info,
      });
    }

    return NextResponse.json({
      success: true,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      lat: 13.0827,
      lng: 80.2707,
      isFallback: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      lat: 13.0827,
      lng: 80.2707,
      isFallback: true,
    });
  }
}
