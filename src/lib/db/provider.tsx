/**
 * FullMoon — Database Provider
 *
 * React context that wraps SQLiteProvider and exposes
 * repository instances to the component tree.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import {
  SQLiteCycleEntryRepository,
  SQLiteAppMetadataRepository,
  type CycleEntryRepository,
  type AppMetadataRepository,
} from './repository';
import { initializeDatabase, DATABASE_NAME } from './schema';

// ─── Context ─────────────────────────────────────────────────────────

interface DatabaseContextValue {
  entries: CycleEntryRepository;
  metadata: AppMetadataRepository;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

/**
 * Hook to access the database repositories.
 * Must be used within a <DatabaseProvider>.
 */
export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase must be used within a <DatabaseProvider>');
  }
  return ctx;
}

// ─── Inner Provider (needs SQLite context) ───────────────────────────

function DatabaseRepositoryProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();

  const value = useMemo<DatabaseContextValue>(
    () => ({
      entries: new SQLiteCycleEntryRepository(db),
      metadata: new SQLiteAppMetadataRepository(db),
    }),
    [db]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

// ─── Outer Provider (wraps SQLiteProvider) ───────────────────────────

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initializeDatabase}>
      <DatabaseRepositoryProvider>
        {children}
      </DatabaseRepositoryProvider>
    </SQLiteProvider>
  );
}
