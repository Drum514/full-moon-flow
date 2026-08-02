/**
 * FullMoon — History Screen
 *
 * Shows a list of past cycles with start date, cycle length,
 * and period duration. Most recent first.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useCycleData } from '@/hooks/useCycleData';
import { colors, spacing, radii, typography, shadows } from '@/design/tokens';
import type { Cycle } from '@/lib/types';

export default function HistoryScreen() {
  const { cycles, isLoaded, refreshData } = useCycleData();

  useEffect(() => {
    if (!isLoaded) {
      refreshData();
    }
  }, [isLoaded]);

  const renderCycleCard = ({ item, index }: { item: Cycle; index: number }) => {
    const startDate = new Date(item.startDate + 'T00:00:00');
    const formattedDate = startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cycleIndicator}>
            <Text style={styles.cycleNumber}>
              {cycles.length - index}
            </Text>
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.startDate}>{formattedDate}</Text>
            {index === 0 && item.cycleLength === null && (
              <Text style={styles.currentBadge}>Current</Text>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {item.periodDuration}
            </Text>
            <Text style={styles.statLabel}>
              {item.periodDuration === 1 ? 'day' : 'days'} of flow
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {item.cycleLength ?? '—'}
            </Text>
            <Text style={styles.statLabel}>
              {item.cycleLength !== null ? 'day cycle' : 'in progress'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!isLoaded) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (cycles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No cycles yet</Text>
        <Text style={styles.emptyText}>
          Log your flow on the Calendar tab to start tracking your cycles.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cycles}
        renderItem={renderCycleCard}
        keyExtractor={(item) => item.startDate}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cycleIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.flowSpotting,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cycleNumber: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  cardHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startDate: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    color: colors.text,
  },
  currentBadge: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.caption,
    color: colors.flowMedium,
    backgroundColor: colors.flowSpotting,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
  },
  statLabel: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  separator: {
    height: spacing.md,
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
    lineHeight: 22,
  },
});
