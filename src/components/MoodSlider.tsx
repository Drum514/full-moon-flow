/**
 * FullMoon — Mood Slider
 *
 * Optional 1–10 mood scale with a draggable horizontal slider.
 * Shows nature-inspired emoji that transitions as the user drags.
 * Designed to sit inside the FlowSelector sheet below flow intensity.
 */

import React, { useRef, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  PanResponder,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { colors, spacing, radii, typography } from '@/design/tokens';

// ─── Types ───────────────────────────────────────────────────────────

interface MoodSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

// ─── Mood Symbol Map ─────────────────────────────────────────────────

/** Nature/weather-inspired symbols for each mood range. */
export const MOOD_SYMBOLS: Record<number, string> = {
  1: '☁️',
  2: '☁️',
  3: '🌥️',
  4: '🌥️',
  5: '🌤️',
  6: '🌤️',
  7: '🌸',
  8: '🌸',
  9: '✨',
  10: '✨',
};

// ─── Constants ───────────────────────────────────────────────────────

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;
const TOUCH_AREA_HEIGHT = 44; // generous touch target

// ─── Helpers ─────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function xToValue(x: number, width: number): number {
  if (width <= 0) return 5;
  const fraction = clamp(x / width, 0, 1);
  return clamp(Math.round(fraction * 9 + 1), 1, 10);
}

function valueToFraction(v: number): number {
  return (v - 1) / 9;
}

// ─── Component ───────────────────────────────────────────────────────

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const layoutRef = useRef({ pageX: 0, width: 0 });

  // Keep latest onChange in a ref so PanResponder stays stable
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    setTrackWidth(width);
    layoutRef.current.width = width;
  }, []);

  const updateValue = useCallback((pageX: number) => {
    const x = pageX - layoutRef.current.pageX;
    const v = xToValue(x, layoutRef.current.width);
    onChangeRef.current(v);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          // Re-measure position each time (handles modal animation offsets)
          trackRef.current?.measureInWindow((pageX) => {
            layoutRef.current.pageX = pageX;
            updateValue(evt.nativeEvent.pageX);
          });
        },
        onPanResponderMove: (evt) => {
          updateValue(evt.nativeEvent.pageX);
        },
      }),
    [updateValue]
  );

  const isSet = value !== null;
  const displayValue = value ?? 5;
  const fraction = valueToFraction(displayValue);
  const thumbLeft =
    trackWidth > 0 ? fraction * trackWidth - THUMB_SIZE / 2 : 0;
  const filledWidth = trackWidth > 0 ? fraction * trackWidth : 0;

  return (
    <View style={styles.container}>
      {/* Header row: label + clear */}
      <View style={styles.header}>
        <Text style={styles.label}>
          {isSet ? 'Overall mood' : 'Overall mood · optional'}
        </Text>
        {isSet && (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>✕ clear</Text>
          </Pressable>
        )}
      </View>

      {/* Current value display (only when set) */}
      {isSet && (
        <View style={styles.valueDisplay}>
          <Text style={styles.emoji}>{MOOD_SYMBOLS[displayValue]}</Text>
          <Text style={styles.valueNumber}>{displayValue}</Text>
        </View>
      )}

      {/* Slider track */}
      <View
        ref={trackRef}
        style={styles.touchArea}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View
          style={[styles.track, !isSet && styles.trackDimmed]}
          pointerEvents="none"
        />

        {/* Filled portion */}
        {isSet && trackWidth > 0 && (
          <View
            style={[styles.trackFilled, { width: filledWidth }]}
            pointerEvents="none"
          />
        )}

        {/* Thumb */}
        {isSet && trackWidth > 0 && (
          <View
            style={[styles.thumb, { left: thumbLeft }]}
            pointerEvents="none"
          />
        )}
      </View>

      {/* Anchor labels at 1, ~5, and 10 */}
      <View style={styles.anchors}>
        <Text style={styles.anchorText}>rough day</Text>
        <Text style={[styles.anchorText, styles.anchorCenter]}>
          in the middle
        </Text>
        <Text style={[styles.anchorText, styles.anchorEnd]}>
          really good day
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
  clearText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
  },
  valueDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  valueNumber: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    color: colors.text,
  },
  touchArea: {
    height: TOUCH_AREA_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    backgroundColor: colors.border,
    borderRadius: TRACK_HEIGHT / 2,
    top: (TOUCH_AREA_HEIGHT - TRACK_HEIGHT) / 2,
  },
  trackDimmed: {
    opacity: 0.5,
  },
  trackFilled: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    backgroundColor: colors.accent,
    borderRadius: TRACK_HEIGHT / 2,
    top: (TOUCH_AREA_HEIGHT - TRACK_HEIGHT) / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    top: (TOUCH_AREA_HEIGHT - THUMB_SIZE) / 2,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  anchors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: 2,
  },
  anchorText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
  },
  anchorCenter: {
    textAlign: 'center',
  },
  anchorEnd: {
    textAlign: 'right',
  },
});
