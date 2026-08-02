/**
 * FullMoon — Cycle Detection
 *
 * Pure functions that derive cycle/period information
 * from raw CycleEntry data. No framework dependencies —
 * operates on plain arrays and returns plain objects.
 *
 * Key concept:
 *   A "period" is a contiguous run of flow days (gaps of ≤1 day
 *   are considered part of the same period to handle spotting gaps).
 *   A "cycle" is the interval from one period start to the next.
 */

import type { CycleEntry, Cycle } from '@/lib/types';

/**
 * Maximum gap (in days) between two flow entries that are still
 * considered part of the same period. A gap of 1 means consecutive
 * days with one skipped day between them are merged.
 */
const MAX_GAP_DAYS = 1;

// ─── Helpers ─────────────────────────────────────────────────────────

/** Parse an ISO date string to a Date at midnight UTC. */
export function parseDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Format a Date to ISO date string (YYYY-MM-DD). */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Difference in days between two ISO date strings. */
export function daysBetween(dateA: string, dateB: string): number {
  const a = parseDate(dateA);
  const b = parseDate(dateB);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Add days to an ISO date string. */
export function addDays(isoDate: string, days: number): string {
  const date = parseDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

// ─── Cycle Detection ─────────────────────────────────────────────────

/**
 * Groups an array of CycleEntry into periods (contiguous flow blocks).
 * Entries must be sorted by date ascending (this function sorts them
 * if they aren't).
 *
 * Returns periods sorted by start date ascending (oldest first).
 */
export function detectPeriods(entries: CycleEntry[]): Omit<Cycle, 'cycleLength'>[] {
  if (entries.length === 0) return [];

  // Sort by date ascending
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const periods: Omit<Cycle, 'cycleLength'>[] = [];
  let currentGroup: CycleEntry[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gap = daysBetween(prev.date, curr.date);

    if (gap <= MAX_GAP_DAYS + 1) {
      // Still part of the same period (gap of 0 = same day duplicate, 1 = consecutive, 2 = one day gap)
      currentGroup.push(curr);
    } else {
      // New period starts
      periods.push(groupToPeriod(currentGroup));
      currentGroup = [curr];
    }
  }

  // Don't forget the last group
  periods.push(groupToPeriod(currentGroup));

  return periods;
}

function groupToPeriod(entries: CycleEntry[]): Omit<Cycle, 'cycleLength'> {
  const startDate = entries[0].date;
  const endDate = entries[entries.length - 1].date;
  return {
    startDate,
    endDate,
    periodDuration: daysBetween(startDate, endDate) + 1,
    entries,
  };
}

/**
 * Derives full Cycle objects from entries, including cycle length.
 *
 * Cycle length = days from this period's start to the next period's start.
 * The most recent period will have cycleLength = null (no next cycle yet).
 *
 * Returns cycles sorted by start date descending (most recent first).
 */
export function detectCycles(entries: CycleEntry[]): Cycle[] {
  const periods = detectPeriods(entries);

  const cycles: Cycle[] = periods.map((period, index) => {
    const nextPeriod = periods[index + 1];
    const cycleLength = nextPeriod
      ? daysBetween(period.startDate, nextPeriod.startDate)
      : null;

    return { ...period, cycleLength };
  });

  // Return most recent first
  return cycles.reverse();
}

/**
 * Finds cycles that have a known cycle length (i.e. completed cycles
 * where the next period has already started).
 */
export function completedCycles(cycles: Cycle[]): Cycle[] {
  return cycles.filter((c): c is Cycle & { cycleLength: number } => c.cycleLength !== null);
}
