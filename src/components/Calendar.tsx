/**
 * FullMoon — Calendar Component
 *
 * A clean, custom-built monthly calendar grid.
 * Shows flow intensity as colored fills on logged days,
 * with a lavender ring for today.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radii, typography, flowColors } from '@/design/tokens';
import type { CycleEntry } from '@/lib/types';
import type { FlowIntensity } from '@/design/tokens';

// ─── Types ───────────────────────────────────────────────────────────

interface CalendarProps {
  year: number;
  month: number; // 1-based (January = 1)
  entries: CycleEntry[];
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayString(): string {
  const now = new Date();
  return formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// ─── Component ───────────────────────────────────────────────────────

export function Calendar({
  year,
  month,
  entries,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const today = getTodayString();

  // Build a lookup map: date string → flow intensity
  const entryMap = useMemo(() => {
    const map = new Map<string, FlowIntensity>();
    for (const entry of entries) {
      map.set(entry.date, entry.flowIntensity);
    }
    return map;
  }, [entries]);

  // Build the grid of day cells
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells: (number | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return cells;
  }, [year, month]);

  // Split into weeks (rows of 7)
  const weeks = useMemo(() => {
    const result: (number | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      const row = calendarDays.slice(i, i + 7);
      // Pad the last row if needed
      while (row.length < 7) row.push(null);
      result.push(row);
    }
    return result;
  }, [calendarDays]);

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.header}>
        <Pressable
          onPress={onPrevMonth}
          style={styles.navButton}
          hitSlop={12}
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>

        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>

        <Pressable
          onPress={onNextMonth}
          style={styles.navButton}
          hitSlop={12}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day === null) {
              return <View key={`empty-${di}`} style={styles.dayCell} />;
            }

            const dateStr = formatDateString(year, month, day);
            const intensity = entryMap.get(dateStr);
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            return (
              <Pressable
                key={dateStr}
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                ]}
                onPress={() => !isFuture && onDayPress(dateStr)}
                disabled={isFuture}
              >
                {intensity ? (
                  <View
                    style={[
                      styles.flowDot,
                      { backgroundColor: flowColors[intensity] },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        intensity === 'heavy' || intensity === 'medium'
                          ? styles.dayTextOnDark
                          : styles.dayTextOnLight,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.dayText,
                      isFuture && styles.dayTextFuture,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  monthTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    color: colors.text,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  navText: {
    fontSize: 28,
    color: colors.text,
    lineHeight: 32,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
  },
  dayLabelCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayLabel: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: radii.full,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.today,
  },
  dayText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.body,
    color: colors.text,
  },
  dayTextOnDark: {
    color: '#FFFFFF',
    fontFamily: typography.fontMedium,
  },
  dayTextOnLight: {
    color: colors.text,
    fontFamily: typography.fontMedium,
  },
  dayTextFuture: {
    color: colors.textTertiary,
  },
  flowDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
