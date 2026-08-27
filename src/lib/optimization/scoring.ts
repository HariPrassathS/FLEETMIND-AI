import { SystemSettings } from './types';

export interface ScoreParameters {
  fuelCostInr: number;
  totalDistanceKm: number;
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
  isAtRisk: boolean;
  isBreached: boolean;
  priorityBonus: number; // 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL
}

/**
 * Calculates a cost-penalty value (lower = better internally).
 * Used by normalizeToScore100 to produce a 0-100 display score.
 */
export function calculateRawCostPenalty(
  params: ScoreParameters,
  settings: SystemSettings
): number {
  const avgUtilization = (params.weightUtilizationPct + params.volumeUtilizationPct) / 2;
  
  // Base cost penalty
  const costComponent = params.fuelCostInr * settings.weight_fuel_cost;
  const distanceComponent = params.totalDistanceKm * 2.5 * settings.weight_distance;

  // Utilization reward (higher utilization reduces score)
  const utilizationReward = (avgUtilization / 100) * 400 * settings.weight_capacity_utilization;

  // SLA penalty
  let deadlinePenalty = 0;
  if (params.isBreached) {
    deadlinePenalty = 10000 * settings.weight_deadline_risk;
  } else if (params.isAtRisk) {
    deadlinePenalty = 1500 * settings.weight_deadline_risk;
  }

  // Priority bonus
  const priorityDeduction = params.priorityBonus * 20;

  const finalScore = costComponent + distanceComponent - utilizationReward + deadlinePenalty - priorityDeduction;
  return Number(Math.max(0, finalScore).toFixed(2));
}

/**
 * Normalizes a raw cost-penalty to a human-friendly 0-100 score (higher = better).
 * 
 * The raw penalty typically ranges from 0 (perfect) to ~5000 (very poor).
 * We map this inversely to 0-100:
 *  - 0 penalty -> 100 score
 *  - 5000+ penalty -> 0 score
 *  - Breached deadline -> max 35
 *  - At risk deadline -> max 65
 */
export function normalizeToScore100(rawPenalty: number, isBreached: boolean, isAtRisk: boolean): number {
  const k = 1800;
  let score = Math.round(100 * Math.exp(-rawPenalty / k));
  
  if (isBreached) score = Math.min(score, 35);
  else if (isAtRisk) score = Math.min(score, 65);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Main scoring function. Returns a composite_score on 0-100 scale (higher = better).
 */
export function calculateCandidateScore(
  params: ScoreParameters,
  settings: SystemSettings
): number {
  const rawPenalty = calculateRawCostPenalty(params, settings);
  return normalizeToScore100(rawPenalty, params.isBreached, params.isAtRisk);
}

/**
 * Deterministic tie-breaker comparison for equally-scored lorry candidates.
 * Returns negative if a should be preferred, positive if b should be preferred.
 * 
 * Order:
 * 1. Higher display score (0-100)
 * 2. Deadline feasibility (SAFE > AT_RISK > BREACHED)
 * 3. Lower total cost
 * 4. Lower fuel consumption
 * 5. Higher capacity utilization
 * 6. Lower total distance
 * 7. Stable lorry ID (alphabetical)
 */
export function compareCandidates(
  a: { score100: number; isBreached: boolean; isAtRisk: boolean; totalCost: number; fuelLiters: number; utilizationPct: number; distanceKm: number; lorryId: string },
  b: { score100: number; isBreached: boolean; isAtRisk: boolean; totalCost: number; fuelLiters: number; utilizationPct: number; distanceKm: number; lorryId: string }
): number {
  if (a.score100 !== b.score100) return b.score100 - a.score100;
  
  const deadlineRank = (x: typeof a) => x.isBreached ? 2 : x.isAtRisk ? 1 : 0;
  const dRank = deadlineRank(a) - deadlineRank(b);
  if (dRank !== 0) return dRank;
  
  if (Math.abs(a.totalCost - b.totalCost) > 1) return a.totalCost - b.totalCost;
  if (Math.abs(a.fuelLiters - b.fuelLiters) > 0.1) return a.fuelLiters - b.fuelLiters;
  if (Math.abs(a.utilizationPct - b.utilizationPct) > 0.1) return b.utilizationPct - a.utilizationPct;
  if (Math.abs(a.distanceKm - b.distanceKm) > 0.1) return a.distanceKm - b.distanceKm;
  
  return a.lorryId.localeCompare(b.lorryId);
}
