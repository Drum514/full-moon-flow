/**
 * FullMoon — Fertility Prediction
 *
 * Pure functions for estimating ovulation and fertile windows
 * from detected cycles. Calendar-based method only (no BBT/LH).
 *
 * Science: Ovulation ≈ next period start − 14 days (fixed luteal phase).
 * Fertile window: 6 days (ovulation − 5 through ovulation day).
 * Peak fertility: ovulation − 2 and ovulation − 1.
 */

import type { Cycle } from '@/lib/types';
import { addDays } from './detection';
import { predictNextPeriod } from './analytics';

export interface FertilityPrediction {
  /** ISO date of estimated ovulation */
  ovulationDate: string;
  /** ISO date: first day of fertile window (ovulation − 5) */
  fertileWindowStart: string;
  /** ISO date: last day of fertile window (ovulation day) */
  fertileWindowEnd: string;
  /** ISO date: first peak fertility day (ovulation − 2) */
  peakStart: string;
  /** ISO date: last peak fertility day (ovulation − 1) */
  peakEnd: string;
  /** Confidence level based on data quantity and cycle regularity */
  confidence: 'low' | 'medium' | 'high';
  /** The average cycle length used for this prediction */
  averageCycleLength: number;
}

/**
 * Estimate the ovulation date from a predicted next period start.
 * Uses the standard 14-day luteal phase assumption.
 */
export function estimateOvulationDate(nextPeriodStartDate: string): string {
  return addDays(nextPeriodStartDate, -14);
}

/**
 * Compute the fertile window boundaries from an ovulation date.
 * Strict 6-day biological window: ovulation − 5 through ovulation.
 */
export function computeFertileWindow(ovulationDate: string) {
  return {
    fertileWindowStart: addDays(ovulationDate, -5),
    fertileWindowEnd: ovulationDate,
    peakStart: addDays(ovulationDate, -2),
    peakEnd: addDays(ovulationDate, -1),
  };
}

/**
 * Predict the fertility window from detected cycles.
 *
 * Returns null if there are no cycles (need at least one period logged).
 * Confidence is capped at 'low' if cycle length variance exceeds 7 days.
 */
export function predictFertility(cycles: Cycle[]): FertilityPrediction | null {
  const periodPrediction = predictNextPeriod(cycles);
  if (!periodPrediction) return null;

  const ovulationDate = estimateOvulationDate(periodPrediction.estimatedDate);
  const window = computeFertileWindow(ovulationDate);

  // Check cycle regularity — cap confidence if variance is too high
  let confidence = periodPrediction.confidence;
  const completedLengths = cycles
    .filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null)
    .map((c) => c.cycleLength);

  if (completedLengths.length >= 2) {
    const variance = Math.max(...completedLengths) - Math.min(...completedLengths);
    if (variance > 7) {
      confidence = 'low';
    }
  }

  return {
    ovulationDate,
    ...window,
    confidence,
    averageCycleLength: periodPrediction.averageCycleLength,
  };
}
