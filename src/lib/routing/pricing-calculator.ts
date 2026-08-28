/**
 * FleetMind AI — Commercial Freight Pricing & Cost Estimation Engine
 * 
 * Computes transparent, real-time logistics rates dynamically based on:
 *  - Real Haversine & Curvature Highway Distance (KM) between Hubs / Coordinates
 *  - Gross Physical Weight (kg / tonnes)
 *  - Bay Volume (m³) and Volumetric Chargeable Weight (250 kg/m³ IATA standard)
 *  - Commodity Category Handling Multipliers (Hazardous, Perishable, Fragile, Medical)
 *  - SLA Priority Multipliers (Critical, High, Medium, Low)
 *  - 18% Statutory Commercial Freight GST
 */

import { ShipmentCategory, ShipmentPriority } from '../optimization/types';
import { resolveCityCoordinates } from './city-coordinates';

export interface FreightCostBreakdown {
  distanceKm: number;
  baseFare: number;
  distanceCost: number;
  weightCost: number;
  volumeCost: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  isVolumetricDominant: boolean;
  categoryMultiplier: number;
  categorySurcharge: number;
  priorityMultiplier: number;
  prioritySurcharge: number;
  fragileSurcharge: number;
  subtotal: number;
  gstAmount: number;
  totalCost: number;
  ratePerKm: number;
  ratePerKg: number;
  currency: string;
}

export interface FreightCostParams {
  pickupCity?: string;
  destCity?: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  distanceKm?: number;
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

  // Calculate highway distance with road curvature factor (1.18x)
  let distanceKm = params.distanceKm;
  if (!distanceKm || distanceKm <= 0) {
    const rawDistance = calculateHaversineKm(pickup.lat, pickup.lng, dest.lat, dest.lng);
    distanceKm = Math.max(35, Math.round(rawDistance * 1.18));
  }

  // 1. Base Dispatch Booking & Terminal Handling
  const baseFare = 450;

  // 2. Highway Distance Cost (Tiered: ₹14/km for short runs, ₹11/km for long haul)
  const ratePerKm = distanceKm > 400 ? 11.5 : distanceKm > 150 ? 13.0 : 15.0;
  const distanceCost = Math.round(distanceKm * ratePerKm);

  // 3. Weight & Volumetric Weight Calculations
  const weightKg = Math.max(1, params.weightKg || 100);
  const volumeM3 = Math.max(0.05, params.volumeM3 || Number((weightKg / 300).toFixed(2)));
  
  // Standard Commercial Volumetric Density: 1 m³ = 250 kg chargeable equivalent
  const volumetricWeightKg = Math.round(volumeM3 * 250);
  const isVolumetricDominant = volumetricWeightKg > weightKg;
  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

  // Weight Rate: Tiered cost per kg
  const ratePerKg = chargeableWeightKg > 5000 ? 2.2 : chargeableWeightKg > 1500 ? 2.8 : 3.5;
  const weightCost = Math.round(weightKg * ratePerKg);

  // 4. Volume Bay Usage Cost (₹90 per m³)
  const volumeCost = Math.round(volumeM3 * 90);

  // 5. Commodity Category Multiplier
  let categoryMultiplier = 1.0;
  const cat = params.category || 'GENERAL';
  if (cat === 'HAZARDOUS') categoryMultiplier = 1.30;
  else if (cat === 'PERISHABLE' || cat === 'FOOD') categoryMultiplier = 1.25;
  else if (cat === 'MEDICAL') categoryMultiplier = 1.20;
  else if (cat === 'ELECTRONICS' || cat === 'FRAGILE') categoryMultiplier = 1.15;
  else if (cat === 'INDUSTRIAL' || cat === 'AUTOMOTIVE') categoryMultiplier = 1.10;

  // 6. Fragile Handling Surcharge
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
    volumetricWeightKg,
    chargeableWeightKg,
    isVolumetricDominant,
    categoryMultiplier,
    categorySurcharge,
    priorityMultiplier,
    prioritySurcharge,
    fragileSurcharge,
    subtotal,
    gstAmount,
    totalCost,
    ratePerKm,
    ratePerKg,
    currency: 'INR',
  };
}
