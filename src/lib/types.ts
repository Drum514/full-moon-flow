/**
 * FullMoon — Data Types
 *
 * Shared type definitions for the data model.
 * Kept separate from DB concerns so cycle-logic can import
 * without pulling in SQLite.
 */

import type { FlowIntensity } from '@/design/tokens';

/** A single logged day of menstrual flow. */
export interface CycleEntry {
  id: string;
  /** ISO 8601 date string (YYYY-MM-DD) */
  date: string;
  flowIntensity: FlowIntensity;
  createdAt: string;
  updatedAt: string;
}

/**
 * A detected menstrual period (contiguous block of flow days)
 * and its relationship to the next period in the sequence.
 */
export interface Cycle {
  /** ISO date of the first flow day in this period */
  startDate: string;
  /** ISO date of the last flow day in this period */
  endDate: string;
  /** Number of days of flow (inclusive) */
  periodDuration: number;
  /** Days from this period start to the next period start (null if no next cycle) */
  cycleLength: number | null;
  /** Individual entries in this period, sorted by date ascending */
  entries: CycleEntry[];
}

/** A data point for the cycle-length trend chart. */
export interface TrendPoint {
  /** ISO date of the cycle start */
  date: string;
  /** Cycle length in days */
  value: number;
  /** 1-indexed cycle number (most recent = highest) */
  cycleIndex: number;
}

/** Prediction result for the next period. */
export interface PeriodPrediction {
  /** Estimated start date (ISO date string) */
  estimatedDate: string;
  /** How much historical data backs this estimate */
  confidence: 'low' | 'medium' | 'high';
  /** The average cycle length used for the prediction */
  averageCycleLength: number;
}
