/**
 * FullMoon — Flow Intensity Selector
 *
 * A bottom-sheet-style modal for logging flow intensity.
 * Shows 4 pill-shaped buttons (spotting/light/medium/heavy)
 * plus a delete option for removing an entry.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  colors,
  spacing,
  radii,
  typography,
  flowColors,
  flowLabels,
  type FlowIntensity,
} from '@/design/tokens';

// ─── Types ───────────────────────────────────────────────────────────

interface FlowSelectorProps {
  visible: boolean;
  date: string | null;
  currentIntensity: FlowIntensity | null;
  onSelect: (intensity: FlowIntensity) => void;
  onDelete: () => void;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const INTENSITIES: FlowIntensity[] = ['spotting', 'light', 'medium', 'heavy'];

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Component ───────────────────────────────────────────────────────

export function FlowSelector({
  visible,
  date,
  currentIntensity,
  onSelect,
  onDelete,
  onClose,
}: FlowSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Date heading */}
          {date && (
            <Text style={styles.dateHeading}>
              {formatDisplayDate(date)}
            </Text>
          )}

          <Text style={styles.label}>
            {currentIntensity ? 'Update flow intensity' : 'Log flow intensity'}
          </Text>

          {/* Intensity buttons */}
          <View style={styles.optionsRow}>
            {INTENSITIES.map((intensity) => {
              const isSelected = intensity === currentIntensity;
              return (
                <Pressable
                  key={intensity}
                  style={[
                    styles.option,
                    { backgroundColor: flowColors[intensity] },
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => onSelect(intensity)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (intensity === 'heavy' || intensity === 'medium') &&
                        styles.optionTextLight,
                    ]}
                  >
                    {flowLabels[intensity]}
                  </Text>
                  {isSelected && (
                    <Text style={[
                      styles.checkmark,
                      (intensity === 'heavy' || intensity === 'medium') &&
                        styles.optionTextLight,
                    ]}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Delete button (only if entry exists) */}
          {currentIntensity && (
            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>Remove entry</Text>
            </Pressable>
          )}

          {/* Cancel */}
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  dateHeading: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  optionSelected: {
    borderWidth: 2.5,
    borderColor: colors.text,
  },
  optionText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  optionTextLight: {
    color: '#FFFFFF',
  },
  checkmark: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  deleteText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.body,
    color: colors.flowHeavy,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
});
