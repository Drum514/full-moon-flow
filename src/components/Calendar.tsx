/**
 * FullMoon — Calendar Component
 *
 * A clean, custom-built monthly calendar grid.
 * Shows flow intensity as colored fills on logged days,
 * with a lavender ring for today.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, radii, typography, flowColors } from '@/design/tokens';
import { addDays } from '@/lib/cycle-logic';
import type { CycleEntry } from '@/lib/types';
import type { FlowIntensity } from '@/design/tokens';
import type { FertilityPrediction } from '@/lib/cycle-logic';

// ─── Types ───────────────────────────────────────────────────────────

interface CalendarProps {
  year: number;
  month: number; // 1-based (January = 1)
  entries: CycleEntry[];
  fertilityPrediction?: FertilityPrediction | null;
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthYearSelect?: (year: number, month: number) => void;
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
  fertilityPrediction,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onMonthYearSelect,
}: CalendarProps) {
  const today = getTodayString();

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(year, month - 1, 1));

  const handleOpenPicker = () => {
    setTempDate(new Date(year, month - 1, 1));
    setShowPicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      if (Platform.OS === 'android') {
        onMonthYearSelect?.(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      } else {
        setTempDate(selectedDate);
      }
    }
  };

  const onConfirmiOS = () => {
    setShowPicker(false);
    onMonthYearSelect?.(tempDate.getFullYear(), tempDate.getMonth() + 1);
  };

  const onCanceliOS = () => {
    setShowPicker(false);
  };

  // Build a lookup map: date string → flow intensity
  const entryMap = useMemo(() => {
    const map = new Map<string, FlowIntensity>();
    for (const entry of entries) {
      map.set(entry.date, entry.flowIntensity);
    }
    return map;
  }, [entries]);

  // Build fertility day status map for the current month
  const fertilityMap = useMemo(() => {
    const map = new Map<string, 'peak' | 'fertile'>();
    if (!fertilityPrediction) return map;

    const todayStr = getTodayString();
    const { fertileWindowStart, fertileWindowEnd, peakStart, peakEnd } = fertilityPrediction;

    // Generate all dates in the fertile window
    let current = fertileWindowStart;
    while (current <= fertileWindowEnd) {
      // Only show for current/future dates, not past
      if (current >= todayStr) {
        // Check if this date falls within the displayed month
        const [y, m] = current.split('-').map(Number);
        if (y === year && m === month) {
          const isPeak = current >= peakStart && current <= peakEnd;
          map.set(current, isPeak ? 'peak' : 'fertile');
        }
      }
      current = addDays(current, 1);
    }
    return map;
  }, [fertilityPrediction, year, month]);

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

        <Pressable onPress={handleOpenPicker} hitSlop={12} style={styles.titlePressable}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
        </Pressable>

        <Pressable
          onPress={onNextMonth}
          style={styles.navButton}
          hitSlop={12}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Month/Year Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={new Date(year, month - 1, 1)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={onCanceliOS}
        >
          <TouchableWithoutFeedback onPress={onCanceliOS}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Button title="Cancel" onPress={onCanceliOS} />
                    <Button title="Done" onPress={onConfirmiOS} />
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

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
                {fertilityMap.has(dateStr) && (
                  <View
                    style={[
                      styles.fertilityDot,
                      {
                        backgroundColor:
                          fertilityMap.get(dateStr) === 'peak'
                            ? colors.fertilityPeak
                            : colors.fertility,
                      },
                    ]}
                  />
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
  fertilityDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  titlePressable: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingBottom: spacing.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
