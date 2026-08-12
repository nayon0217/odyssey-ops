import type { TextStyle } from 'react-native';

// Inter is the Ody brand face; system-ui is the graceful fallback (and matches the
// platform's own optical tuning on the reviewer's machine). Loaded on web via +html.tsx.
const fontFamily = {
  base: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
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
} as const;

// Apple typography discipline: tracking is size-specific. Large display text gets
// NEGATIVE tracking (it reads too loose as it grows); small text gets a slight positive
// bump for legibility; body sits near zero. Leading tightens as size grows.
export const textVariants = {
  display: {
    fontFamily: fontFamily.base,
    fontSize: size['3xl'],
    fontWeight: weight.bold,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: fontFamily.base,
    fontSize: size['2xl'],
    fontWeight: weight.bold,
    lineHeight: 34,
    letterSpacing: -0.6,
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
