/**
 * FullMoon — Cycle Entry Repository
 *
 * Abstracts all database operations behind an interface.
 * This enables:
 * 1. Future cloud sync adapter without touching UI code
 * 2. Testing with mock implementations
 * 3. Potential platform-specific adapters (e.g. IndexedDB for web)
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import type { FlowIntensity } from '@/design/tokens';
import type { CycleEntry } from '@/lib/types';

// ─── Repository Interface ────────────────────────────────────────────

export interface CycleEntryRepository {
  upsertEntry(date: string, intensity: FlowIntensity, moodScore?: number | null): Promise<void>;
  deleteEntry(date: string): Promise<void>;
  getEntry(date: string): Promise<CycleEntry | null>;
  getEntriesInRange(startDate: string, endDate: string): Promise<CycleEntry[]>;
  getAllEntries(): Promise<CycleEntry[]>;
}

export interface AppMetadataRepository {
  getValue(key: string): Promise<string | null>;
  setValue(key: string, value: string): Promise<void>;
}

// ─── SQLite Implementation ───────────────────────────────────────────

/** Row shape returned from SQLite queries (snake_case column names). */
interface CycleEntryRow {
  id: string;
  date: string;
  flow_intensity: string;
  mood_score: number | null;
  created_at: string;
  updated_at: string;
}

function rowToEntry(row: CycleEntryRow): CycleEntry {
  return {
    id: row.id,
    date: row.date,
    flowIntensity: row.flow_intensity as FlowIntensity,
    moodScore: row.mood_score ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateId(): string {
  // Simple hex ID; crypto.randomUUID() not available on all RN platforms
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i++) {
    id += chars[Math.floor(Math.random() * 16)];
  }
  return id;
}

export class SQLiteCycleEntryRepository implements CycleEntryRepository {
  constructor(private db: SQLiteDatabase) {}

  async upsertEntry(date: string, intensity: FlowIntensity, moodScore?: number | null): Promise<void> {
    const mood = moodScore ?? null;
    const existing = await this.getEntry(date);
    if (existing) {
      await this.db.runAsync(
        `UPDATE cycle_entries 
         SET flow_intensity = ?, mood_score = ?, updated_at = datetime('now') 
         WHERE date = ?`,
        [intensity, mood, date]
      );
    } else {
      const id = generateId();
      await this.db.runAsync(
        `INSERT INTO cycle_entries (id, date, flow_intensity, mood_score) 
         VALUES (?, ?, ?, ?)`,
        [id, date, intensity, mood]
      );
    }
  }

  async deleteEntry(date: string): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM cycle_entries WHERE date = ?',
      [date]
    );
  }

  async getEntry(date: string): Promise<CycleEntry | null> {
    const row = await this.db.getFirstAsync<CycleEntryRow>(
      'SELECT * FROM cycle_entries WHERE date = ?',
      [date]
    );
    return row ? rowToEntry(row) : null;
  }

  async getEntriesInRange(startDate: string, endDate: string): Promise<CycleEntry[]> {
    const rows = await this.db.getAllAsync<CycleEntryRow>(
      'SELECT * FROM cycle_entries WHERE date >= ? AND date <= ? ORDER BY date ASC',
      [startDate, endDate]
    );
    return rows.map(rowToEntry);
  }

  async getAllEntries(): Promise<CycleEntry[]> {
    const rows = await this.db.getAllAsync<CycleEntryRow>(
      'SELECT * FROM cycle_entries ORDER BY date ASC'
    );
    return rows.map(rowToEntry);
  }
}

export class SQLiteAppMetadataRepository implements AppMetadataRepository {
  constructor(private db: SQLiteDatabase) {}

  async getValue(key: string): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ?',
      [key]
    );
    return row?.value ?? null;
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO app_metadata (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value]
    );
  }
}
