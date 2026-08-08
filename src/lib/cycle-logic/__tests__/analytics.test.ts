import {
  averageCycleLength,
  averagePeriodDuration,
  cycleLengthTrend,
  predictNextPeriod,
  computeSummary,
} from '@/lib/cycle-logic/analytics';
import { detectCycles } from '@/lib/cycle-logic/detection';
import type { CycleEntry } from '@/lib/types';

function makeEntry(date: string): CycleEntry {
  return {
    id: `id-${date}`,
    date,
    flowIntensity: 'medium',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    moodScore: null,
  };
}

describe('Cycle Logic Analytics', () => {
  describe('averageCycleLength', () => {
    it('returns null for empty array', () => {
      expect(averageCycleLength([])).toBeNull();
    });

    it('returns null if no completed cycles', () => {
      const cycles = detectCycles([makeEntry('2023-01-01')]);
      expect(averageCycleLength(cycles)).toBeNull();
    });

    it('calculates average correctly for all-time', () => {
      const entries = [
        makeEntry('2023-01-01'), // cycleLength = 31
        makeEntry('2023-02-01'), // cycleLength = 28
        makeEntry('2023-03-01'), // cycleLength = null
      ];
      const cycles = detectCycles(entries);
      expect(averageCycleLength(cycles)).toBe(29.5); // (31 + 28) / 2
    });

    it('calculates rolling average correctly', () => {
      const entries = [
        makeEntry('2023-01-01'), // 31
        makeEntry('2023-02-01'), // 28
        makeEntry('2023-03-01'), // 31
        makeEntry('2023-04-01'), // 30
        makeEntry('2023-05-01'), // null
      ];
      const cycles = detectCycles(entries);
      // Most recent completed: 30, 31, 28, 31
      // rolling 2 = 30 + 31 / 2 = 30.5
      expect(averageCycleLength(cycles, 2)).toBe(30.5);
    });
  });

  describe('averagePeriodDuration', () => {
    it('returns null for empty array', () => {
      expect(averagePeriodDuration([])).toBeNull();
    });

    it('calculates average period duration correctly', () => {
      const entries = [
        makeEntry('2023-01-01'), makeEntry('2023-01-02'), // 2 days
        makeEntry('2023-02-01'), makeEntry('2023-02-02'), makeEntry('2023-02-03'), // 3 days
      ];
      const cycles = detectCycles(entries);
      expect(averagePeriodDuration(cycles)).toBe(2.5);
    });

    it('calculates rolling average period duration', () => {
      const entries = [
        makeEntry('2023-01-01'), makeEntry('2023-01-02'), // 2 days
        makeEntry('2023-02-01'), makeEntry('2023-02-02'), makeEntry('2023-02-03'), // 3 days
        makeEntry('2023-03-01'), // 1 day
      ];
      const cycles = detectCycles(entries);
      // most recent first: 1, 3, 2
      // rolling 2: (1 + 3) / 2 = 2
      expect(averagePeriodDuration(cycles, 2)).toBe(2);
    });
  });

  describe('cycleLengthTrend', () => {
    it('returns empty array if no completed cycles', () => {
      const cycles = detectCycles([makeEntry('2023-01-01')]);
      expect(cycleLengthTrend(cycles)).toEqual([]);
    });

    it('generates trend sorted oldest-first with correct index', () => {
      const entries = [
        makeEntry('2023-01-01'), // 31
        makeEntry('2023-02-01'), // 28
        makeEntry('2023-03-01'), // 31
        makeEntry('2023-04-01'), // null
      ];
      const cycles = detectCycles(entries);
      const trend = cycleLengthTrend(cycles, 2); // get last 2 completed
      // completed (recent first): March(31), Feb(28), Jan(31)
      // rolling 2: March(31), Feb(28)
      // output oldest first: Feb(28), March(31)
      expect(trend).toHaveLength(2);
      expect(trend[0]).toMatchObject({ date: '2023-02-01', value: 28, cycleIndex: 1 });
      expect(trend[1]).toMatchObject({ date: '2023-03-01', value: 31, cycleIndex: 2 });
    });
  });

  describe('predictNextPeriod', () => {
    it('returns null for empty array', () => {
      expect(predictNextPeriod([])).toBeNull();
    });

    it('returns low confidence default of 28 days for 0 completed cycles', () => {
      const cycles = detectCycles([makeEntry('2023-01-01')]);
      const pred = predictNextPeriod(cycles);
      expect(pred).toMatchObject({
        estimatedDate: '2023-01-29',
        confidence: 'low',
        averageCycleLength: 28,
      });
    });

    it('returns low confidence with 1 completed cycle', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-31'), // 30 days
      ];
      const cycles = detectCycles(entries);
      const pred = predictNextPeriod(cycles);
      expect(pred).toMatchObject({
        estimatedDate: '2023-03-02', // Jan 31 + 30 days
        confidence: 'low',
        averageCycleLength: 30,
      });
    });

    it('returns medium confidence with 3 completed cycles', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-31'), // 30
        makeEntry('2023-03-02'), // 30
        makeEntry('2023-04-01'), // 30
      ];
      const cycles = detectCycles(entries);
      const pred = predictNextPeriod(cycles);
      expect(pred?.confidence).toBe('medium');
    });

    it('returns high confidence with 6+ completed cycles', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-29'),
        makeEntry('2023-02-26'),
        makeEntry('2023-03-26'),
        makeEntry('2023-04-23'),
        makeEntry('2023-05-21'),
        makeEntry('2023-06-18'), // 6 completed cycles
      ];
      const cycles = detectCycles(entries);
      const pred = predictNextPeriod(cycles);
      expect(pred?.confidence).toBe('high');
    });
  });

  describe('computeSummary', () => {
    it('returns a full summary object', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-31'),
      ];
      const cycles = detectCycles(entries);
      const summary = computeSummary(cycles);
      expect(summary.totalCycles).toBe(2);
      expect(summary.completedCycles).toBe(1);
      expect(summary.avgCycleLength).toBe(30);
      expect(summary.avgPeriodDuration).toBe(1);
      expect(summary.prediction).not.toBeNull();
      expect(summary.trend).toHaveLength(1);
    });
  });
});
