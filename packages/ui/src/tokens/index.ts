import { colors } from './colors';
import { spacing, layout } from './spacing';
import { typography, textVariants } from './typography';
import { radius, border, shadow, zIndex, motion } from './elevation';

// The single tokens object every component imports from. No component inlines a hex
// color, raw pixel, or font size — everything traces back here.
export const tokens = {
  colors,
  spacing,
  layout,
  typography,
  textVariants,
  radius,
  border,
  shadow,
  zIndex,
  motion,
} as const;

export type Tokens = typeof tokens;

export { colors, spacing, layout, typography, textVariants, radius, border, shadow, zIndex, motion };
export type { TextVariant } from './typography';
