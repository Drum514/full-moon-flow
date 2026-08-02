/**
 * FullMoon — Data Hooks
 *
 * Bridges the database, cycle-logic, and Zustand store.
 * Provides a clean API for screens to load and mutate data.
 */

import { useCallback } from 'react';
import { useDatabase } from '@/lib/db/provider';
import { useAppStore } from '@/lib/store';
import { detectCycles, computeSummary } from '@/lib/cycle-logic';
import type { FlowIntensity } from '@/design/tokens';
import type { CycleEntry } from '@/lib/types';

/**
 * Hook that provides all data operations for the app.
 * Call refreshData() after any mutation to keep the store in sync.
 */
export function useCycleData() {
  const { entries: repo, metadata } = useDatabase();
  const store = useAppStore();

  /** Reload all entries from DB, recompute cycles and summary. */
  const refreshData = useCallback(async () => {
    const allEntries = await repo.getAllEntries();
    const cycles = detectCycles(allEntries);
    const summary = computeSummary(cycles);

    store.setEntries(allEntries);
    store.setCycles(cycles);
    store.setSummary(summary);
    store.setIsLoaded(true);
  }, [repo, store]);

  /** Log or update flow intensity for a date. */
  const logEntry = useCallback(
    async (date: string, intensity: FlowIntensity) => {
      await repo.upsertEntry(date, intensity);
      await refreshData();
    },
    [repo, refreshData]
  );

  /** Remove a logged entry for a date. */
  const removeEntry = useCallback(
    async (date: string) => {
      await repo.deleteEntry(date);
      await refreshData();
    },
    [repo, refreshData]
  );

  /** Get entries for a specific month (for calendar rendering). */
  const getEntriesForMonth = useCallback(
    async (year: number, month: number): Promise<CycleEntry[]> => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return repo.getEntriesInRange(startDate, endDate);
    },
    [repo]
  );

  /** Check and load onboarding status. */
  const checkOnboarding = useCallback(async () => {
    const value = await metadata.getValue('onboarding_complete');
    store.setOnboardingComplete(value === 'true');
  }, [metadata, store]);

  /** Mark onboarding as complete. */
  const completeOnboarding = useCallback(async () => {
    await metadata.setValue('onboarding_complete', 'true');
    store.setOnboardingComplete(true);
  }, [metadata, store]);

  return {
    // State (from store)
    entries: store.entries,
    cycles: store.cycles,
    summary: store.summary,
    isLoaded: store.isLoaded,
    onboardingComplete: store.onboardingComplete,

    // Actions
    refreshData,
    logEntry,
    removeEntry,
    getEntriesForMonth,
    checkOnboarding,
    completeOnboarding,
  };
}
