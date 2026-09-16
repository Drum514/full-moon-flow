/**
 * FullMoon — Cycle Analytics
 *
 * Pure functions for computing statistics, trends, and predictions
 * from detected cycles. No framework dependencies.
 */

import type { Cycle, TrendPoint, PeriodPrediction } from '@/lib/types';
import { addDays } from './detection';
import { predictFertility } from './fertility';
import type { FertilityPrediction } from './fertility';

// ─── Averages ────────────────────────────────────────────────────────

/**
 * Calculate the average cycle length from completed cycles.
 *
 * @param cycles - Array of Cycle objects (from detectCycles)
 * @param rolling - If provided, only uses the N most recent completed cycles
 * @returns Average cycle length in days, or null if insufficient data
 */
export function averageCycleLength(
  cycles: Cycle[],
  rolling?: number
): number | null {
  const completed = cycles.filter(
    (c): c is Cycle & { cycleLength: number } => c.cycleLength !== null
  );

  if (completed.length === 0) return null;

  const subset = rolling ? completed.slice(0, rolling) : completed;
  if (subset.length === 0) return null;

  const sum = subset.reduce((acc, c) => acc + c.cycleLength, 0);
  return Math.round((sum / subset.length) * 10) / 10;
}

/**
 * Calculate the average period duration.
 *
 * @param cycles - Array of Cycle objects
 * @param rolling - If provided, only uses the N most recent cycles
 * @returns Average period duration in days, or null if no data
 */
export function averagePeriodDuration(
  cycles: Cycle[],
  rolling?: number
): number | null {
  if (cycles.length === 0) return null;

  const subset = rolling ? cycles.slice(0, rolling) : cycles;
  if (subset.length === 0) return null;

  const sum = subset.reduce((acc, c) => acc + c.periodDuration, 0);
  return Math.round((sum / subset.length) * 10) / 10;
}

// ─── Trend ───────────────────────────────────────────────────────────

/**
 * Generate trend data points for cycle length over recent cycles.
 * Used for the analytics line chart.
 *
 * @param cycles - Array of Cycle objects (most recent first)
 * @param count - Number of recent cycles to include (default 12)
 * @returns Array of TrendPoint sorted oldest-first (for chart rendering)
 */
export function cycleLengthTrend(
  cycles: Cycle[],
  count: number = 12
): TrendPoint[] {
  const completed = cycles.filter(
    (c): c is Cycle & { cycleLength: number } => c.cycleLength !== null
  );

  const recent = completed.slice(0, count);

  // Reverse to oldest-first for chart x-axis
  return recent
    .map((c, i) => ({
      date: c.startDate,
      value: c.cycleLength,
      cycleIndex: recent.length - i,
    }))
    .reverse();
}

// ─── Prediction ──────────────────────────────────────────────────────

/**
 * Predict the next period start date based on historical averages.
 *
 * Uses the rolling 6-cycle average if available, falls back to all-time.
 * Confidence is based on the amount of historical data.
 *
 * @param cycles - Array of Cycle objects (most recent first)
 * @returns Prediction object, or null if insufficient data
 */
export function predictNextPeriod(cycles: Cycle[]): PeriodPrediction | null {
  if (cycles.length === 0) return null;

  const mostRecentStart = cycles[0].startDate;

  // Try rolling average first, fall back to all-time
  const rollingAvg = averageCycleLength(cycles, 6);
  const allTimeAvg = averageCycleLength(cycles);
  const avg = rollingAvg ?? allTimeAvg;

  if (avg === null) {
    // Only one cycle with no completed cycle length — use default 28 days
    return {
      estimatedDate: addDays(mostRecentStart, 28),
      confidence: 'low',
      averageCycleLength: 28,
    };
  }

  const completedCount = cycles.filter((c) => c.cycleLength !== null).length;

  let confidence: PeriodPrediction['confidence'];
  if (completedCount >= 6) {
    confidence = 'high';
  } else if (completedCount >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    estimatedDate: addDays(mostRecentStart, Math.round(avg)),
    confidence,
    averageCycleLength: avg,
  };
}

// ─── Summary ─────────────────────────────────────────────────────────

export interface CycleSummary {
  totalCycles: number;
  completedCycles: number;
  avgCycleLength: number | null;
  avgCycleLengthRolling3: number | null;
  avgPeriodDuration: number | null;
  prediction: PeriodPrediction | null;
  fertility: FertilityPrediction | null;
  trend: TrendPoint[];
}

/**
 * Compute a full analytics summary from detected cycles.
 * Convenience function that calls all the individual analytics functions.
 */
export function computeSummary(cycles: Cycle[]): CycleSummary {
  return {
    totalCycles: cycles.length,
    completedCycles: cycles.filter((c) => c.cycleLength !== null).length,
    avgCycleLength: averageCycleLength(cycles),
    avgCycleLengthRolling3: averageCycleLength(cycles, 3),
    avgPeriodDuration: averagePeriodDuration(cycles),
    prediction: predictNextPeriod(cycles),
    fertility: predictFertility(cycles),
    trend: cycleLengthTrend(cycles),
  };
}
