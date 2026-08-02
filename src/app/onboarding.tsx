/**
 * FullMoon — Onboarding Screen
 *
 * Minimal first-launch flow: asks for the most recent period
 * start date, seeds one entry, and navigates to the main app.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCycleData } from '@/hooks/useCycleData';
import { colors, spacing, radii, typography } from '@/design/tokens';
import { formatDate } from '@/lib/cycle-logic';

export default function OnboardingScreen() {
  const router = useRouter();
  const { logEntry, completeOnboarding } = useCycleData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleGetStarted = async () => {
    // Seed an entry with 'medium' as a reasonable default
    const isoDate = formatDate(selectedDate);
    await logEntry(isoDate, 'medium');
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App title */}
        <View style={styles.header}>
          <Text style={styles.appName}>Full Moon Flow</Text>
          <Text style={styles.tagline}>
            Simple, private period tracking
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.question}>
            When did your most recent period start?
          </Text>
          <Text style={styles.hint}>
            This helps us estimate your next cycle. You can adjust it later.
          </Text>

          {/* Date display / picker trigger */}
          {Platform.OS === 'android' && (
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.dateButtonText}>{formattedDate}</Text>
            </Pressable>
          )}

          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={handleDateChange}
                themeVariant="light"
              />
            </View>
          )}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={handleGetStarted}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>

        <Text style={styles.privacyNote}>
          Your data never leaves this device.
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  appName: {
    fontFamily: typography.fontMedium,
    fontSize: 36,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.subtitle,
    color: colors.textSecondary,
  },
  questionSection: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  dateButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dateButtonText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    color: colors.text,
  },
  pickerContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.flowMedium,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    color: '#FFFFFF',
  },
  privacyNote: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
