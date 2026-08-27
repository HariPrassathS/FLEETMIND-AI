/**
 * FleetMind AI — Commercial Freight Pricing & Cost Estimation Engine
 * 
 * Computes transparent, real-time logistics rates based on:
 *  - Real Haversine Highway Distance (KM) between Hubs / Coordinates
 *  - Gross Payload Weight (kg) & Bay Volume (m³)
 *  - Commodity Handling Multipliers (Hazardous, Cold-Chain, Fragile, Medical)
 *  - SLA Priority Multipliers (Critical, High, Medium, Low)
 *  - GST (18% Statutory Commercial Freight Tax)
 */

import { ShipmentCategory, ShipmentPriority } from '../optimization/types';
import { resolveCityCoordinates } from './city-coordinates';

export interface FreightCostBreakdown {
  distanceKm: number;
  baseFare: number;
  distanceCost: number;
  weightCost: number;
  volumeCost: number;
  categoryMultiplier: number;
  categorySurcharge: number;
  priorityMultiplier: number;
  prioritySurcharge: number;
  fragileSurcharge: number;
  subtotal: number;
  gstAmount: number;
  totalCost: number;
  currency: string;
}

export interface FreightCostParams {
  pickupCity?: string;
  destCity?: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  weightKg: number;
  volumeM3?: number;
  category?: ShipmentCategory;
  priority?: ShipmentPriority;
  fragile?: boolean;
}

export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateFreightCost(params: FreightCostParams): FreightCostBreakdown {
  const pickup = resolveCityCoordinates(params.pickupCity, {
    lat: params.pickupLat || 13.0827,
    lng: params.pickupLng || 80.2707,
  });

  const dest = resolveCityCoordinates(params.destCity, {
    lat: params.destLat || 12.9716,
    lng: params.destLng || 77.5946,
  });

  const rawDistance = calculateHaversineKm(pickup.lat, pickup.lng, dest.lat, dest.lng);
  const distanceKm = Math.max(35, Math.round(rawDistance * 1.18)); // Highway curvature factor

  // 1. Base Freight Booking Fee
  const baseFare = 450;

  // 2. Distance Cost (₹14.00 per Highway KM)
  const distanceCost = Math.round(distanceKm * 14.0);

  // 3. Weight Payload Cost (₹3.50 per kg)
  const weightKg = Math.max(1, params.weightKg || 100);
  const weightCost = Math.round(weightKg * 3.5);

  // 4. Volume Bay Usage Cost (₹120 per m³)
  const volumeM3 = Math.max(0.1, params.volumeM3 || (weightKg / 300));
  const volumeCost = Math.round(volumeM3 * 120);

  // 5. Commodity Category Multiplier
  let categoryMultiplier = 1.0;
  const cat = params.category || 'GENERAL';
  if (cat === 'HAZARDOUS') categoryMultiplier = 1.30;
  else if (cat === 'PERISHABLE' || cat === 'FOOD') categoryMultiplier = 1.25;
  else if (cat === 'MEDICAL') categoryMultiplier = 1.20;
  else if (cat === 'ELECTRONICS' || cat === 'FRAGILE') categoryMultiplier = 1.15;
  else if (cat === 'INDUSTRIAL' || cat === 'AUTOMOTIVE') categoryMultiplier = 1.10;

  // 6. Fragile Handling Flat Addon
  const fragileSurcharge = params.fragile ? 350 : 0;

  // 7. Priority SLA Multiplier
  let priorityMultiplier = 1.0;
  const pri = params.priority || 'MEDIUM';
  if (pri === 'CRITICAL') priorityMultiplier = 1.35;
  else if (pri === 'HIGH') priorityMultiplier = 1.20;
  else if (pri === 'LOW') priorityMultiplier = 0.95;

  const baseSum = baseFare + distanceCost + weightCost + volumeCost + fragileSurcharge;
  const categorySurcharge = Math.round(baseSum * (categoryMultiplier - 1.0));
  const prioritySurcharge = Math.round((baseSum + categorySurcharge) * (priorityMultiplier - 1.0));

  const subtotal = Math.round((baseSum + categorySurcharge) * priorityMultiplier);
  const gstAmount = Math.round(subtotal * 0.18); // 18% Logistics GST
  const totalCost = subtotal + gstAmount;

  return {
    distanceKm,
    baseFare,
    distanceCost,
    weightCost,
    volumeCost,
    categoryMultiplier,
    categorySurcharge,
    priorityMultiplier,
    prioritySurcharge,
    fragileSurcharge,
    subtotal,
    gstAmount,
    totalCost,
    currency: 'INR',
  };
}
