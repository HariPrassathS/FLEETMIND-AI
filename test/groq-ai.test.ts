import { describe, it, expect } from 'vitest';
import { parseShipmentWithAI, generateAssignmentExplanation, answerFleetMindAIQuestion } from '../src/lib/ai/groq';

describe('FleetMind AI & Groq LPU Integration', () => {
  it('should parse natural language shipment text correctly', async () => {
    const text = 'Send 3.5 tonnes of cotton yarn from Karur to Chennai CFS before tomorrow 6 PM';
    const parsed = await parseShipmentWithAI(text);

    expect(parsed.weight_kg).toBeGreaterThanOrEqual(2000);
    expect(parsed.pickup_city).toBe('Karur');
    expect(parsed.destination_city).toBe('Chennai');
    expect(parsed.commodity).toBeDefined();
    expect(parsed.category).toBe('TEXTILE');
  }, 15000);

  it('should generate crisp multi-objective decision explanation', async () => {
    const explanation = await generateAssignmentExplanation('L-11', 'L-07', {
      selectedDistance: 310,
      selectedFuelEfficiency: 4.8,
      selectedCostInr: 6850,
      altDistance: 290,
      altFuelEfficiency: 3.6,
      altCostInr: 8400,
      fuelSavedInr: 1550,
    });

    expect(explanation).toContain('L-11');
    expect(explanation.length).toBeGreaterThan(30);
  });

  it('should answer operational questions with verified backend tool facts', async () => {
    const result = await answerFleetMindAIQuestion('Which shipments are at risk of SLA breach?');

    expect(result.toolUsed).toBe('getAtRiskShipments');
    expect(result.answer).toBeDefined();
    expect(result.answer.length).toBeGreaterThan(20);
    expect(result.toolData).toBeDefined();
  });
});
