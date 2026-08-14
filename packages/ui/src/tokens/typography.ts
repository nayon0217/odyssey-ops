import type { TextStyle } from 'react-native';

// Type pairing for the pastel ops console:
// - Instrument Serif: display / KPIs / page headings (geometric serif)
// - Plus Jakarta Sans: body / UI chrome (clean geometric humanist sans)
// Loaded on web via WebFonts / +html.tsx.
const fontFamily = {
  display: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  base: "'Plus Jakarta Sans', 'SF Pro Text', -apple-system, system-ui, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '700',
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
  '4xl': 40,
  '5xl': 48,
} as const;

// Apple typography discipline: tracking is size-specific. Large display text gets
// NEGATIVE tracking (it reads too loose as it grows); small text gets a slight positive
// bump for legibility; body sits near zero. Leading tightens as size grows — but stays
// above the em size so glyphs never clip.
export const textVariants = {
  // Big attention-grabbing numerals for KPIs / hero stats. Tight tracking,
  // and TABULAR figures so digits stay column-aligned as values change.
  // lineHeight is deliberately > fontSize so descenders/currency symbols aren't clipped.
  stat: {
    fontFamily: fontFamily.display,
    fontSize: size['5xl'],
    fontWeight: weight.regular,
    lineHeight: 56,
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  statSm: {
    fontFamily: fontFamily.display,
    fontSize: size['4xl'],
    fontWeight: weight.regular,
    lineHeight: 48,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
  display: {
    fontFamily: fontFamily.display,
    fontSize: size['3xl'],
    fontWeight: weight.regular,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: fontFamily.display,
    fontSize: size['2xl'],
    fontWeight: weight.regular,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: size.xl,
    fontWeight: weight.regular,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamily.base,
    fontSize: size.lg,
    fontWeight: weight.semibold,
    lineHeight: 26,
    letterSpacing: -0.15,
  },
  title: {
    fontFamily: fontFamily.base,
    fontSize: size.md,
    fontWeight: weight.semibold,
    lineHeight: 24,
    letterSpacing: -0.05,
  },
  body: {
    fontFamily: fontFamily.base,
    fontSize: size.base,
    fontWeight: weight.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontFamily: fontFamily.base,
    fontSize: size.base,
    fontWeight: weight.semibold,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: fontFamily.base,
    fontSize: size.sm,
    fontWeight: weight.regular,
    lineHeight: 20,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamily.base,
    fontSize: size.sm,
    fontWeight: weight.medium,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: fontFamily.base,
    fontSize: size.xs,
    fontWeight: weight.regular,
    lineHeight: 18,
    letterSpacing: 0.15,
  },
  overline: {
    fontFamily: fontFamily.base,
    fontSize: size.xs,
    fontWeight: weight.semibold,
    lineHeight: 18,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: size.sm,
    fontWeight: weight.regular,
    lineHeight: 20,
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
