/**
 * FullMoon — Calendar Screen
 *
 * The primary screen: monthly calendar view where users
 * tap a day to log or edit flow intensity.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from '@/components/Calendar';
import { FlowSelector } from '@/components/FlowSelector';
import { useCycleData } from '@/hooks/useCycleData';
import { colors, spacing } from '@/design/tokens';
import type { CycleEntry } from '@/lib/types';
import type { FlowIntensity } from '@/design/tokens';

export default function CalendarScreen() {
  const router = useRouter();
  const {
    summary,
    logEntry,
    removeEntry,
    getEntriesForMonth,
    refreshData,
    isLoaded,
    checkOnboarding,
    onboardingComplete,
    fertilityEnabled,
    loadFertilitySetting,
  } = useCycleData();

  // Current displayed month
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  // Entries for the displayed month
  const [monthEntries, setMonthEntries] = useState<CycleEntry[]>([]);

  // Flow selector modal state
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<FlowIntensity | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isExistingEntry, setIsExistingEntry] = useState(false);

  // Load initial data and check onboarding
  useEffect(() => {
    const init = async () => {
      await checkOnboarding();
      await loadFertilitySetting();
      await refreshData();
    };
    init();
  }, []);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isLoaded && !onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [isLoaded, onboardingComplete]);

  // Load entries when month changes or data refreshes
  const loadMonthEntries = useCallback(async () => {
    const entries = await getEntriesForMonth(currentYear, currentMonth);
    setMonthEntries(entries);
  }, [currentYear, currentMonth, getEntriesForMonth]);

  useEffect(() => {
    if (isLoaded) {
      loadMonthEntries();
    }
  }, [isLoaded, currentYear, currentMonth, loadMonthEntries]);

  // ─── Month Navigation ───────────────────────────────────────────

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToMonthYear = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // ─── Day Press Handler ──────────────────────────────────────────

  const handleDayPress = (date: string) => {
    const existing = monthEntries.find((e) => e.date === date);
    setSelectedDate(date);
    setSelectedIntensity(existing?.flowIntensity ?? null);
    setSelectedMood(existing?.moodScore ?? null);
    setIsExistingEntry(!!existing);
    setSelectorVisible(true);
  };

  // ─── Flow Selector Handlers ─────────────────────────────────────

  /** Update draft flow intensity (keeps the sheet open). */
  const handleIntensityChange = (intensity: FlowIntensity) => {
    setSelectedIntensity(intensity);
  };

  /** Persist the current draft (flow + mood) to the DB and close the sheet. */
  const handleSave = async () => {
    if (selectedDate && selectedIntensity) {
      await logEntry(selectedDate, selectedIntensity, selectedMood);
      await loadMonthEntries();
    }
    setSelectorVisible(false);
  };

  const handleDeleteEntry = async () => {
    if (selectedDate) {
      await removeEntry(selectedDate);
      await loadMonthEntries();
    }
    setSelectorVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          year={currentYear}
          month={currentMonth}
          entries={monthEntries}
          fertilityPrediction={fertilityEnabled ? summary?.fertility ?? null : null}
          onDayPress={handleDayPress}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onMonthYearSelect={goToMonthYear}
        />

        {/* Flow legend */}
        <View style={styles.legend}>
          <LegendDot color={colors.flowSpotting} label="Spotting" />
          <LegendDot color={colors.flowLight} label="Light" />
          <LegendDot color={colors.flowMedium} label="Medium" />
          <LegendDot color={colors.flowHeavy} label="Heavy" />
        </View>

        {fertilityEnabled && summary?.fertility && (
          <View style={styles.legend}>
            <LegendDot color={colors.fertility} label="Fertile" />
            <LegendDot color={colors.fertilityPeak} label="Peak fertile" />
          </View>
        )}
      </ScrollView>

      <FlowSelector
        visible={selectorVisible}
        date={selectedDate}
        currentIntensity={selectedIntensity}
        moodScore={selectedMood}
        onMoodChange={setSelectedMood}
        onSelect={handleIntensityChange}
        onSave={handleSave}
        onDelete={handleDeleteEntry}
        onClose={() => setSelectorVisible(false)}
        isExistingEntry={isExistingEntry}
      />
    </View>
  );
}

// ─── Legend Component ────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color }]} />
      <View>
        <Text style={legendStyles.label}>{label}</Text>
      </View>
    </View>
  );
}

import { Text } from 'react-native';

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});

const legendStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
});
