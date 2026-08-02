/**
 * FullMoon Theme Helpers
 *
 * Shared StyleSheet factories and common style patterns,
 * all consuming design tokens for consistency.
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, radii, typography, shadows } from './tokens';

/**
 * Common text styles used throughout the app.
 */
export const textStyles = StyleSheet.create({
  hero: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.hero,
    lineHeight: typography.lineHeights.hero,
    color: colors.text,
  },
  title: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.title,
    lineHeight: typography.lineHeights.title,
    color: colors.text,
  },
  subtitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sizes.subtitle,
    lineHeight: typography.lineHeights.subtitle,
    color: colors.text,
  },
  body: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    color: colors.text,
  },
  small: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: typography.fontRegular,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colors.textSecondary,
  },
});

/**
 * Common layout patterns.
 */
export const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Card styles.
 */
export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardCompact: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
});
