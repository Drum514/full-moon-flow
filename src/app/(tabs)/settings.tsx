/**
 * FullMoon — Settings Screen
 *
 * Minimal settings: CSV export button, app info.
 * Structured to accept future settings without rework.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useCycleData } from '@/hooks/useCycleData';
import { shareCSV } from '@/lib/export/csv';
import { colors, spacing, radii, typography, shadows } from '@/design/tokens';

export default function SettingsScreen() {
  const { entries } = useCycleData();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (entries.length === 0) {
      Alert.alert(
        'No data to export',
        'Log some flow data on the Calendar tab first.'
      );
      return;
    }

    setIsExporting(true);
    try {
      await shareCSV(entries);
    } catch (error) {
      Alert.alert(
        'Export failed',
        'Something went wrong while exporting your data. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Export section */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.card}>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            pressed && styles.rowPressed,
          ]}
          onPress={handleExport}
          disabled={isExporting}
        >
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Export data</Text>
            <Text style={styles.rowDescription}>
              Download all logged entries as a CSV file
            </Text>
          </View>
          <Text style={styles.rowChevron}>›</Text>
        </Pressable>
      </View>

      {/* About section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Full Moon Flow</Text>
            <Text style={styles.rowDescription}>
              Version 1.1.0
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Privacy</Text>
            <Text style={styles.rowDescription}>
              All data is stored locally on your device. No accounts, no cloud sync, no tracking.
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Entries logged</Text>
            <Text style={styles.rowDescription}>
              {entries.length} {entries.length === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rowPressed: {
    backgroundColor: colors.pressedOverlay,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.body,
    color: colors.text,
    marginBottom: 2,
  },
  rowDescription: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  rowChevron: {
    fontFamily: typography.fontRegular,
    fontSize: 22,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg,
  },
});
