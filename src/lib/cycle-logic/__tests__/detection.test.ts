import {
  parseDate,
  formatDate,
  daysBetween,
  addDays,
  detectPeriods,
  detectCycles,
  completedCycles,
} from '@/lib/cycle-logic/detection';
import type { CycleEntry } from '@/lib/types';

function makeEntry(date: string): CycleEntry {
  return {
    id: `id-${date}`,
    date,
    flowIntensity: 'medium',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };
}

describe('Cycle Logic Detection', () => {
  describe('Date Helpers', () => {
    it('parseDate and formatDate work correctly', () => {
      const iso = '2023-05-10';
      const date = parseDate(iso);
      expect(date.getUTCFullYear()).toBe(2023);
      expect(date.getUTCMonth()).toBe(4); // May
      expect(date.getUTCDate()).toBe(10);
      expect(formatDate(date)).toBe(iso);
    });

    it('daysBetween calculates correct diff', () => {
      expect(daysBetween('2023-01-01', '2023-01-05')).toBe(4);
      expect(daysBetween('2023-01-05', '2023-01-01')).toBe(-4);
      expect(daysBetween('2023-02-28', '2023-03-01')).toBe(1); // Non-leap year
      expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2); // Leap year
    });

    it('addDays works correctly', () => {
      expect(addDays('2023-01-01', 4)).toBe('2023-01-05');
      expect(addDays('2023-01-05', -4)).toBe('2023-01-01');
      expect(addDays('2023-02-28', 1)).toBe('2023-03-01');
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    });
  });

  describe('detectPeriods', () => {
    it('handles empty inputs', () => {
      expect(detectPeriods([])).toEqual([]);
    });

    it('handles a single entry', () => {
      const entries = [makeEntry('2023-01-01')];
      const periods = detectPeriods(entries);
      expect(periods).toHaveLength(1);
      expect(periods[0]).toMatchObject({
        startDate: '2023-01-01',
        endDate: '2023-01-01',
        periodDuration: 1,
        entries,
      });
    });

    it('handles single complete period (multiple contiguous days)', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-02'),
        makeEntry('2023-01-03'),
      ];
      const periods = detectPeriods(entries);
      expect(periods).toHaveLength(1);
      expect(periods[0].startDate).toBe('2023-01-01');
      expect(periods[0].endDate).toBe('2023-01-03');
      expect(periods[0].periodDuration).toBe(3);
    });

    it('handles periods with 1-day gap (should merge)', () => {
      const entries = [
        makeEntry('2023-01-01'),
        // Gap on 01-02
        makeEntry('2023-01-03'),
      ];
      const periods = detectPeriods(entries);
      expect(periods).toHaveLength(1);
      expect(periods[0].periodDuration).toBe(3); // 1st to 3rd = 3 days
    });

    it('handles periods with 2+ day gap (should split)', () => {
      const entries = [
        makeEntry('2023-01-01'),
        // Gap on 01-02 and 01-03
        makeEntry('2023-01-04'),
      ];
      const periods = detectPeriods(entries);
      expect(periods).toHaveLength(2);
      expect(periods[0].startDate).toBe('2023-01-01');
      expect(periods[1].startDate).toBe('2023-01-04');
    });

    it('handles same-day duplicates (should merge)', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-01'),
      ];
      const periods = detectPeriods(entries);
      expect(periods).toHaveLength(1);
      expect(periods[0].periodDuration).toBe(1);
    });
  });

  describe('detectCycles', () => {
    it('returns empty array for no entries', () => {
      expect(detectCycles([])).toEqual([]);
    });

    it('returns single cycle with null cycleLength for single period', () => {
      const entries = [makeEntry('2023-01-01'), makeEntry('2023-01-02')];
      const cycles = detectCycles(entries);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].cycleLength).toBeNull();
    });

    it('derives cycle lengths for multiple complete cycles', () => {
      const entries = [
        makeEntry('2023-01-01'), // Cycle 1 start
        makeEntry('2023-01-02'),
        makeEntry('2023-01-29'), // Cycle 2 start (28 days later)
        makeEntry('2023-01-30'),
        makeEntry('2023-02-28'), // Cycle 3 start (30 days later)
      ];
      const cycles = detectCycles(entries);
      expect(cycles).toHaveLength(3);
      // Order is most recent first
      expect(cycles[0].startDate).toBe('2023-02-28');
      expect(cycles[0].cycleLength).toBeNull();

      expect(cycles[1].startDate).toBe('2023-01-29');
      expect(cycles[1].cycleLength).toBe(30);

      expect(cycles[2].startDate).toBe('2023-01-01');
      expect(cycles[2].cycleLength).toBe(28);
    });
  });

  describe('completedCycles', () => {
    it('filters out cycles without a cycleLength', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-02-01'), // length 31
      ];
      const cycles = detectCycles(entries);
      const completed = completedCycles(cycles);
      expect(completed).toHaveLength(1);
      expect(completed[0].startDate).toBe('2023-01-01');
      expect(completed[0].cycleLength).toBe(31);
    });
  });
});
