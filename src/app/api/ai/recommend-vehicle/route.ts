import { NextResponse } from "next/server";
import { generateVehicleRecommendation } from "../../../../lib/ai/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shipment, candidates } = body;

    if (!shipment || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: "Missing shipment or candidates" }, { status: 400 });
    }

    const result = await generateVehicleRecommendation({
      shipmentCode: shipment.shipment_code ?? "SHP-UNKNOWN",
      pickupCity: shipment.pickup_city ?? "Origin",
      destinationCity: shipment.destination_city ?? "Destination",
      weightKg: shipment.weight_kg ?? 0,
      volumeM3: shipment.volume_m3 ?? 0,
      deliveryDeadline: shipment.delivery_deadline ?? new Date(Date.now() + 24 * 3600000).toISOString(),
      candidates: candidates.map((c: any) => ({
        lorry_code: c.lorry?.lorry_code ?? c.lorry_code ?? "L-?",
        model: c.lorry?.model ?? c.model ?? "Unknown",
        decision_type: c.decision_type ?? "ASSIGN_NEW_VEHICLE",
        fuel_efficiency_km_per_l: c.fuel_efficiency_km_per_l ?? c.lorry?.fuel_efficiency_km_per_l ?? 6.5,
        cost_per_km_inr: c.cost_per_km_inr ?? 0,
        fuel_cost_per_km_inr: c.fuel_cost_per_km_inr ?? 0,
        deadhead_distance_km: c.deadhead_distance_km,
        direct_distance_km: c.direct_distance_km,
        projected_route_distance_km: c.projected_route_distance_km ?? 0,
        additional_distance_km: c.additional_distance_km ?? 0,
        incremental_cost_inr: c.incremental_cost_inr ?? 0,
        net_savings_inr: c.net_savings_inr ?? 0,
        deadline_buffer_minutes: c.deadline_buffer_minutes ?? 0,
        projected_weight_util_pct: c.projected_weight_util_pct ?? 0,
        projected_volume_util_pct: c.projected_volume_util_pct ?? 0,
        deterministic_score: c.deterministic_score ?? 0,
        is_feasible: c.is_feasible ?? false,
        reasons: Array.isArray(c.reasons) ? c.reasons : [],
      })),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[recommend-vehicle] Error:", error);
    return NextResponse.json({ error: error.message ?? "Internal Server Error" }, { status: 500 });
  }
}
