/**
 * FullMoon — Database Schema & Migrations
 *
 * Defines the SQLite table structure and handles schema versioning.
 * Uses expo-sqlite's onInit callback for initial setup.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Initialize the database schema.
 * Called by SQLiteProvider's onInit prop on first open.
 */
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // Enable WAL mode for better concurrent read performance
  await db.execAsync('PRAGMA journal_mode = WAL');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cycle_entries (
      id            TEXT PRIMARY KEY,
      date          TEXT NOT NULL UNIQUE,
      flow_intensity TEXT NOT NULL CHECK (flow_intensity IN ('spotting','light','medium','heavy')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_cycle_entries_date 
    ON cycle_entries(date);
  `);

  // App metadata table (for onboarding-complete flag, etc.)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migration: add optional mood_score column to cycle_entries
  try {
    await db.execAsync(
      'ALTER TABLE cycle_entries ADD COLUMN mood_score INTEGER CHECK (mood_score IS NULL OR (mood_score >= 1 AND mood_score <= 10))'
    );
  } catch {
    // Column already exists — safe to ignore after first migration
  }
}

/** Database file name */
export const DATABASE_NAME = 'fullmoon.db';
