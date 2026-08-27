import { NextResponse } from 'next/server';
import { generateAssignmentExplanation } from '../../../../lib/ai/groq';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
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
      explanation: 'FleetMind AI selected this vehicle to maximize fuel economy and net trip margin while fulfilling customer delivery SLAs.',
    });
  }
}
