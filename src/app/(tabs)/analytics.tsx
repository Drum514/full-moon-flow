/**
 * FullMoon — Analytics Screen
 *
 * Shows cycle statistics, trend chart, and next period prediction.
 * All data is derived from logged entries via pure cycle-logic functions.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useCycleData } from '@/hooks/useCycleData';
import { colors, spacing, radii, typography, shadows } from '@/design/tokens';
import type { CycleSummary } from '@/lib/cycle-logic';
import type { PeriodPrediction, TrendPoint } from '@/lib/types';

export default function AnalyticsScreen() {
  const { summary, isLoaded, refreshData } = useCycleData();

  useEffect(() => {
    if (!isLoaded) {
      refreshData();
    }
  }, [isLoaded]);

  if (!isLoaded || !summary) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (summary.totalCycles === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptyText}>
          Log your flow on the Calendar tab to see analytics and predictions.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats cards row */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Avg cycle"
          value={summary.avgCycleLength !== null ? `${summary.avgCycleLength}` : '—'}
          unit="days"
          sublabel="all-time"
        />
        <StatCard
          label="Avg cycle"
          value={summary.avgCycleLengthRolling3 !== null ? `${summary.avgCycleLengthRolling3}` : '—'}
          unit="days"
          sublabel="last 3 cycles"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Avg period"
          value={summary.avgPeriodDuration !== null ? `${summary.avgPeriodDuration}` : '—'}
          unit="days"
        />
        <StatCard
          label="Cycles tracked"
          value={`${summary.totalCycles}`}
          unit=""
        />
      </View>

      {/* Prediction card */}
      {summary.prediction && (
        <PredictionCard prediction={summary.prediction} />
      )}

      {/* Trend chart */}
      {summary.trend.length >= 2 && (
        <TrendChart data={summary.trend} />
      )}
    </ScrollView>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  sublabel,
}: {
  label: string;
  value: string;
  unit: string;
  sublabel?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
      {sublabel && <Text style={styles.statSublabel}>{sublabel}</Text>}
    </View>
  );
}

// ─── Prediction Card ─────────────────────────────────────────────────

function PredictionCard({ prediction }: { prediction: PeriodPrediction }) {
  const date = new Date(prediction.estimatedDate + 'T00:00:00');
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const confidenceLabels = {
    low: 'Limited data — treat as a rough guess',
    medium: 'Based on a few cycles — becoming more accurate',
    high: 'Based on 6+ cycles — fairly reliable',
  };

  return (
    <View style={styles.predictionCard}>
      <Text style={styles.predictionTitle}>Next period estimate</Text>
      <Text style={styles.predictionDate}>{formattedDate}</Text>
      <Text style={styles.predictionMeta}>
        Based on {prediction.averageCycleLength}-day average cycle
      </Text>
      <View style={styles.disclaimerRow}>
        <Text style={styles.disclaimerIcon}>ℹ</Text>
        <Text style={styles.disclaimer}>
          {confidenceLabels[prediction.confidence]}. This is an estimate, not a guarantee.
        </Text>
      </View>
    </View>
  );
}

// ─── Simple Trend Chart (pure RN, no library dependency) ─────────────

function TrendChart({ data }: { data: TrendPoint[] }) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const CHART_HEIGHT = 140;
  const BAR_WIDTH = 28;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Cycle length trend</Text>
      <Text style={styles.chartSubtitle}>
        Last {data.length} cycles (days)
      </Text>

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>{max}</Text>
          <Text style={styles.yAxisLabel}>{Math.round((max + min) / 2)}</Text>
          <Text style={styles.yAxisLabel}>{min}</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((point, i) => {
            const normalizedHeight =
              ((point.value - min) / range) * (CHART_HEIGHT - 24) + 24;

            return (
              <View key={point.date} style={styles.barWrapper}>
                <View style={[styles.barContainer, { height: CHART_HEIGHT }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: normalizedHeight,
                        backgroundColor:
                          i === data.length - 1
                            ? colors.flowMedium
                            : colors.flowLight,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{point.value}</Text>
                <Text style={styles.barXLabel}>
                  {new Date(point.date + 'T00:00:00').toLocaleDateString(
                    'en-US',
                    { month: 'short' }
                  )}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  statLabel: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.hero,
    color: colors.text,
  },
  statUnit: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  statSublabel: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // Prediction
  predictionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...shadows.card,
  },
  predictionTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  predictionDate: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  predictionMeta: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  disclaimerIcon: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 1,
  },
  disclaimer: {
    flex: 1,
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  chartTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  chartSubtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 28,
    justifyContent: 'space-between',
    height: 140,
    marginRight: spacing.sm,
  },
  yAxisLabel: {
    fontFamily: typography.fontRegular,
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
  },
  barContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: radii.sm,
    minHeight: 4,
  },
  barLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 10,
    color: colors.text,
    marginTop: 4,
  },
  barXLabel: {
    fontFamily: typography.fontRegular,
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
