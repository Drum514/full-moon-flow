/**
 * FullMoon — App Store
 *
 * Lightweight Zustand store for UI state that doesn't belong
 * in the database. Keeps component state minimal.
 */

import { create } from 'zustand';
import type { CycleEntry, Cycle } from '@/lib/types';
import type { CycleSummary } from '@/lib/cycle-logic';

interface AppState {
  /** All entries loaded from the database, sorted by date ascending */
  entries: CycleEntry[];
  /** Detected cycles derived from entries */
  cycles: Cycle[];
  /** Analytics summary derived from cycles */
  summary: CycleSummary | null;
  /** Whether the initial data load has completed */
  isLoaded: boolean;
  /** Whether onboarding has been completed */
  onboardingComplete: boolean;
  /** Whether fertility indicators are enabled */
  fertilityEnabled: boolean;

  // Actions
  setEntries: (entries: CycleEntry[]) => void;
  setCycles: (cycles: Cycle[]) => void;
  setSummary: (summary: CycleSummary) => void;
  setIsLoaded: (loaded: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setFertilityEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  entries: [],
  cycles: [],
  summary: null,
  isLoaded: false,
  onboardingComplete: false,
  fertilityEnabled: true,

  setEntries: (entries) => set({ entries }),
  setCycles: (cycles) => set({ cycles }),
  setSummary: (summary) => set({ summary }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  setFertilityEnabled: (enabled) => set({ fertilityEnabled: enabled }),
}));
