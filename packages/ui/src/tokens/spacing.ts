// 4px base spacing scale. Layout uses these — never raw pixel literals.
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// Shared layout rules.
export const layout = {
  sidebarWidth: 248,
  topbarHeight: 60,
  contentMaxWidth: 1200,
  gutter: 24,
} as const;

export type Spacing = typeof spacing;
