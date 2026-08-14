import type { TextStyle } from 'react-native';

// Plus Jakarta Sans is the Ody brand face — a geometric humanist sans with the friendly,
// slightly-rounded character the pastel theme calls for. system-ui / SF Pro is the graceful
// fallback (and matches the platform's own optical tuning). Loaded on web via +html.tsx.
const fontFamily = {
  base: "'Plus Jakarta Sans', 'SF Pro Display', -apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

const size = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 27,
  '3xl': 34,
  '4xl': 44,
  '5xl': 56,
} as const;

// Apple typography discipline: tracking is size-specific. Large display text gets
// NEGATIVE tracking (it reads too loose as it grows); small text gets a slight positive
// bump for legibility; body sits near zero. Leading tightens as size grows.
export const textVariants = {
  // Big attention-grabbing numerals for KPIs / hero stats. Extrabold, very tight tracking,
  // and TABULAR figures so digits stay column-aligned as values change.
  stat: {
    fontFamily: fontFamily.base,
    fontSize: size['5xl'],
    fontWeight: weight.extrabold,
    lineHeight: 58,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  statSm: {
    fontFamily: fontFamily.base,
    fontSize: size['4xl'],
    fontWeight: weight.extrabold,
    lineHeight: 46,
    letterSpacing: -1.4,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  display: {
    fontFamily: fontFamily.base,
    fontSize: size['3xl'],
    fontWeight: weight.extrabold,
    lineHeight: 40,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: fontFamily.base,
    fontSize: size['2xl'],
    fontWeight: weight.extrabold,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  h2: {
    fontFamily: fontFamily.base,
    fontSize: size.xl,
    fontWeight: weight.semibold,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  h3: {
    fontFamily: fontFamily.base,
    fontSize: size.lg,
    fontWeight: weight.semibold,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: fontFamily.base,
    fontSize: size.md,
    fontWeight: weight.semibold,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fontFamily.base,
    fontSize: size.base,
    fontWeight: weight.regular,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontFamily: fontFamily.base,
    fontSize: size.base,
    fontWeight: weight.semibold,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fontFamily.base,
    fontSize: size.sm,
    fontWeight: weight.regular,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamily.base,
    fontSize: size.sm,
    fontWeight: weight.medium,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: fontFamily.base,
    fontSize: size.xs,
    fontWeight: weight.regular,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: fontFamily.base,
    fontSize: size.xs,
    fontWeight: weight.semibold,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: size.sm,
    fontWeight: weight.regular,
    lineHeight: 18,
    letterSpacing: 0,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;

export const typography = {
  fontFamily,
  weight,
  size,
  variants: textVariants,
} as const;

export type Typography = typeof typography;
