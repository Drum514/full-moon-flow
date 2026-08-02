/**
 * FullMoon — CSV Export
 *
 * Triggers platform-appropriate file sharing for CSV data.
 * Pure CSV generation is in ./generate.ts for testability.
 */

import { Platform } from 'react-native';
import type { CycleEntry } from '@/lib/types';
import { generateCSV } from './generate';

export { generateCSV } from './generate';

/**
 * Share a CSV file using the platform's native share sheet.
 *
 * On mobile: writes to temp file and opens share sheet via expo-sharing.
 * On web: triggers a browser download.
 */
export async function shareCSV(entries: CycleEntry[]): Promise<void> {
  const csv = generateCSV(entries);
  const filename = `fullmoon-export-${new Date().toISOString().slice(0, 10)}.csv`;

  if (Platform.OS === 'web') {
    await downloadCSVWeb(csv, filename);
  } else {
    await shareCSVNative(csv, filename);
  }
}

// ─── Platform-specific implementations ───────────────────────────────

async function shareCSVNative(csv: string, filename: string): Promise<void> {
  // Dynamic imports to avoid bundling these on web
  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const file = new File(Paths.cache, filename);
  file.write(csv);

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export period data',
    UTI: 'public.comma-separated-values-text',
  });
}

async function downloadCSVWeb(csv: string, filename: string): Promise<void> {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
