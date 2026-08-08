import { generateCSV } from '@/lib/export/generate';
import type { CycleEntry } from '@/lib/types';

function makeEntry(
  date: string,
  intensity: CycleEntry['flowIntensity'] = 'medium',
  moodScore: number | null = null,
): CycleEntry {
  return {
    id: `id-${date}`,
    date,
    flowIntensity: intensity,
    moodScore,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };
}

describe('CSV Export', () => {
  it('returns just the header for an empty array', () => {
    expect(generateCSV([])).toBe('date,flow_intensity,mood_score');
  });

  it('generates correct CSV format for entries', () => {
    const entries = [
      makeEntry('2023-01-01', 'light'),
      makeEntry('2023-01-02', 'heavy'),
    ];
    const csv = generateCSV(entries);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('date,flow_intensity,mood_score');
    expect(lines[1]).toBe('2023-01-01,light,');
    expect(lines[2]).toBe('2023-01-02,heavy,');
  });

  it('sorts entries by date ascending', () => {
    const entries = [
      makeEntry('2023-01-02', 'heavy'),
      makeEntry('2023-01-01', 'light'),
      makeEntry('2023-01-03', 'medium'),
    ];
    const csv = generateCSV(entries);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[1]).toBe('2023-01-01,light,');
    expect(lines[2]).toBe('2023-01-02,heavy,');
    expect(lines[3]).toBe('2023-01-03,medium,');
  });

  it('exports mood_score when present, blank when null', () => {
    const entries = [
      makeEntry('2023-01-01', 'light', 3),
      makeEntry('2023-01-02', 'heavy'),
      makeEntry('2023-01-03', 'medium', 8),
    ];
    const csv = generateCSV(entries);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('date,flow_intensity,mood_score');
    expect(lines[1]).toBe('2023-01-01,light,3');
    expect(lines[2]).toBe('2023-01-02,heavy,');
    expect(lines[3]).toBe('2023-01-03,medium,8');
  });
});
