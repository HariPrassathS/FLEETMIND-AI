import { NextResponse } from 'next/server';
import { generateAssignmentExplanation, generateConsolidationExplanation } from '../../../../lib/ai/groq';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (body.type === 'CONSOLIDATION' || body.decisionType) {
      const explanation = await generateConsolidationExplanation({
        shipmentCode: body.shipmentCode || 'SHP-1042',
        pickupCity: body.pickupCity || 'Palladam',
        destinationCity: body.destinationCity || 'Coimbatore',
        weightKg: Number(body.weightKg || 300),
        volumeM3: Number(body.volumeM3 || 2),
        decisionType: body.decisionType || 'ADD_TO_EXISTING_TRIP',
        lorryCode: body.lorryCode || 'L-007',
        driverName: body.driverName || 'Arun',
        existingCorridor: body.existingCorridor || 'Chennai ➔ Coimbatore',
        additionalDistanceKm: Number(body.additionalDistanceKm || 22),
        additionalTimeMinutes: Number(body.additionalTimeMinutes || 45),
        additionalFuelLiters: Number(body.additionalFuelLiters || 3.14),
        netSavingsInr: Number(body.netSavingsInr || 1840),
        projectedWeightUtilPct: Number(body.projectedWeightUtilPct || 57.5),
        reasons: Array.isArray(body.reasons) ? body.reasons : ['✓ Available payload capacity', '✓ Minimal detour'],
      });
      return NextResponse.json({ explanation });
    }

    const explanation = await generateAssignmentExplanation(
      body.selectedLorryCode || 'L-18',
      body.alternativeLorryCode || 'L-11',
      body.metrics || {
        selectedDistance: 19,
        selectedFuelEfficiency: 10.4,
        selectedCostInr: 2867,
        altDistance: 12,
        altFuelEfficiency: 5.0,
        altCostInr: 5828,
        fuelSavedInr: 2961,
      }
    );
    return NextResponse.json({ explanation });
  } catch (error: any) {
    return NextResponse.json({
      explanation: 'FleetMind AI selected this option to maximize load factor and fuel economy while respecting customer SLAs and operational safety.',
    });
  }
}
