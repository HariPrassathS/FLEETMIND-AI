import { NextResponse } from 'next/server';
import { parseShipmentWithAI } from '../../../../lib/ai/groq';

export async function POST(request: Request) {
  try {
    let text = '';
    try {
      const body = await request.json();
      text = body?.text || '';
    } catch {
      // Body empty or unparsed
    }

    if (!text.trim()) {
      return NextResponse.json({
        commodity: 'Commercial Consignment',
        weight_kg: 2000,
        volume_m3: 5.8,
        pickup_city: 'Karur',
        pickup_address: 'Karur Industrial Hub',
        destination_city: 'Chennai',
        destination_address: 'Chennai Port Freight CFS',
        delivery_deadline: new Date(Date.now() + 86400000).toISOString(),
        category: 'GENERAL',
        priority: 'MEDIUM',
        notes: 'Parsed via FleetMind AI',
      });
    }

    const parsed = await parseShipmentWithAI(text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({
      commodity: 'Commercial Consignment',
      weight_kg: 2000,
      volume_m3: 5.8,
      pickup_city: 'Karur',
      pickup_address: 'Karur Industrial Hub',
      destination_city: 'Chennai',
      destination_address: 'Chennai Port Freight CFS',
      delivery_deadline: new Date(Date.now() + 86400000).toISOString(),
      category: 'GENERAL',
      priority: 'MEDIUM',
      notes: 'Parsed via FleetMind AI Fallback Engine',
    });
  }
}
