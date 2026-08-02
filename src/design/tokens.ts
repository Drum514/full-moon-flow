/**
 * FullMoon Design Tokens
 *
 * Central source of truth for all visual constants.
 * Import from here — never hardcode colors, spacing, or font values.
 */

// ─── Colors ──────────────────────────────────────────────────────────
export const colors = {
  // Backgrounds
  background: '#FDF8F5', // warm off-white
  surface: '#FFFFFF',
  surfaceElevated: '#FEFCFA',

  // Text
  text: '#3D3D3D', // charcoal grey (not pure black)
  textSecondary: '#8A8A8A',
  textTertiary: '#B5B0AC',

  // Flow intensity palette — dusty rose spectrum
  flowSpotting: '#F2D5CE',
  flowLight: '#E8B4A8',
  flowMedium: '#D4897A',
  flowHeavy: '#B85C4E',

  // Accents
  accent: '#C5B8D9', // soft lavender
  accentAlt: '#B8CCBA', // sage green

  // UI chrome
  border: '#EDE8E4',
  borderLight: '#F5F0ED',
  divider: '#F0EBE7',

  // Tab bar
  tabActive: '#B85C4E', // dusty rose
  tabInactive: '#BFBFBF',
  tabBar: '#FEFCFA',

  // Interactive states
  pressedOverlay: 'rgba(0, 0, 0, 0.04)',
  disabledText: '#CFCBC7',

  // Semantic
  today: '#C5B8D9', // lavender ring for today
  prediction: '#C5B8D9', // lavender for predicted days
} as const;

// ─── Flow Intensity Map ──────────────────────────────────────────────
export const flowColors = {
  spotting: colors.flowSpotting,
  light: colors.flowLight,
  medium: colors.flowMedium,
  heavy: colors.flowHeavy,
} as const;

export type FlowIntensity = keyof typeof flowColors;

export const flowLabels: Record<FlowIntensity, string> = {
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

// ─── Spacing ─────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border Radii ────────────────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────
export const typography = {
  fontRegular: 'Inter_400Regular',
  fontMedium: 'Inter_500Medium',

  sizes: {
    caption: 12,
    small: 13,
    body: 15,
    subtitle: 17,
    title: 22,
    hero: 28,
  },

  lineHeights: {
    caption: 16,
    small: 18,
    body: 22,
    subtitle: 24,
    title: 28,
    hero: 36,
  },
} as const;

// ─── Shadows (subtle, for cards) ────────────────────────────────────
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

// ─── Animation ───────────────────────────────────────────────────────
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
