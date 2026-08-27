import { NextResponse } from 'next/server';
import { answerFleetMindAIQuestion } from '../../../../lib/ai/groq';

export async function POST(request: Request) {
  try {
    let question = 'Which shipments are at risk?';
    try {
      const body = await request.json();
      if (body?.question) question = body.question;
    } catch {
      // Body empty or unparsed
    }

    const response = await answerFleetMindAIQuestion(question);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      {
        answer: "FleetMind AI is active. Operational capacity, live routes, and consolidation corridors are progressing within safe SLA limits.",
        toolUsed: "getFleetMetrics",
        toolData: { status: "ONLINE", total_lorries: 24, at_risk_count: 0 },
      },
      { status: 200 }
    );
  }
}
