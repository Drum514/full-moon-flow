/**
 * FullMoon — CSV Generation (pure function)
 *
 * No framework dependencies — purely operates on data.
 * Separate from the sharing/export logic for testability.
 */

import type { CycleEntry } from '@/lib/types';

/**
 * Generate CSV string from cycle entries.
 * Columns: date, flow_intensity, mood_score
 */
export function generateCSV(entries: CycleEntry[]): string {
  const header = 'date,flow_intensity,mood_score';
  const rows = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => `${e.date},${e.flowIntensity},${e.moodScore ?? ''}`);

  return [header, ...rows].join('\n');
}
