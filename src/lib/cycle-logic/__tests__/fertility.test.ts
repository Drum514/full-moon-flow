import {
  estimateOvulationDate,
  computeFertileWindow,
  predictFertility,
} from '@/lib/cycle-logic/fertility';
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

describe('Fertility Prediction', () => {
  describe('estimateOvulationDate', () => {
    it('returns 14 days before next period for 28-day cycle', () => {
      expect(estimateOvulationDate('2023-02-01')).toBe('2023-01-18');
    });

    it('returns correct date for 35-day cycle', () => {
      expect(estimateOvulationDate('2023-02-08')).toBe('2023-01-25');
    });

    it('handles month boundary correctly', () => {
      expect(estimateOvulationDate('2023-01-10')).toBe('2022-12-27');
    });
  });

  describe('computeFertileWindow', () => {
    it('returns 6-day window ending on ovulation day', () => {
      const result = computeFertileWindow('2023-01-18');
      expect(result.fertileWindowStart).toBe('2023-01-13');
      expect(result.fertileWindowEnd).toBe('2023-01-18');
    });

    it('identifies peak days as ovulation −2 and −1', () => {
      const result = computeFertileWindow('2023-01-18');
      expect(result.peakStart).toBe('2023-01-16');
      expect(result.peakEnd).toBe('2023-01-17');
    });
  });

  describe('predictFertility', () => {
    it('returns null for empty cycles', () => {
      expect(predictFertility([])).toBeNull();
    });

    it('returns prediction with low confidence for 1 cycle', () => {
      const cycles = detectCycles([makeEntry('2023-01-01')]);
      const result = predictFertility(cycles);
      expect(result).not.toBeNull();
      expect(result!.confidence).toBe('low');
      // Default 28-day cycle: next period Jan 29, ovulation Jan 15
      expect(result!.ovulationDate).toBe('2023-01-15');
      expect(result!.fertileWindowStart).toBe('2023-01-10');
      expect(result!.fertileWindowEnd).toBe('2023-01-15');
    });

    it('returns medium confidence with 3 completed cycles', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-31'),
        makeEntry('2023-03-02'),
        makeEntry('2023-04-01'),
      ];
      const cycles = detectCycles(entries);
      const result = predictFertility(cycles);
      expect(result?.confidence).toBe('medium');
    });

    it('returns high confidence with 6+ completed regular cycles', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-29'),
        makeEntry('2023-02-26'),
        makeEntry('2023-03-26'),
        makeEntry('2023-04-23'),
        makeEntry('2023-05-21'),
        makeEntry('2023-06-18'),
      ];
      const cycles = detectCycles(entries);
      const result = predictFertility(cycles);
      expect(result?.confidence).toBe('high');
    });

    it('caps confidence at low when cycle variance exceeds 7 days', () => {
      // Cycles with lengths: 24, 35, 28, 30, 26, 33 (variance = 35−24 = 11 > 7)
      const entries = [
        makeEntry('2023-01-01'),  // +24
        makeEntry('2023-01-25'),  // +35
        makeEntry('2023-03-01'),  // +28
        makeEntry('2023-03-29'),  // +30
        makeEntry('2023-04-28'),  // +26
        makeEntry('2023-05-24'),  // +33
        makeEntry('2023-06-26'),  // current (no cycleLength)
      ];
      const cycles = detectCycles(entries);
      const result = predictFertility(cycles);
      expect(result).not.toBeNull();
      expect(result!.confidence).toBe('low');
    });

    it('computes correct fertile window for a 30-day average cycle', () => {
      const entries = [
        makeEntry('2023-01-01'),
        makeEntry('2023-01-31'), // 30-day cycle
      ];
      const cycles = detectCycles(entries);
      const result = predictFertility(cycles);
      // Next period: Jan 31 + 30 = Mar 2
      // Ovulation: Mar 2 − 14 = Feb 16
      // Fertile window: Feb 11 – Feb 16
      // Peak: Feb 14 – Feb 15
      expect(result!.ovulationDate).toBe('2023-02-16');
      expect(result!.fertileWindowStart).toBe('2023-02-11');
      expect(result!.fertileWindowEnd).toBe('2023-02-16');
      expect(result!.peakStart).toBe('2023-02-14');
      expect(result!.peakEnd).toBe('2023-02-15');
    });
  });
});
