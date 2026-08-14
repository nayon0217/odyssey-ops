// Color tokens. Components reference the SEMANTIC groups (surface/text/border/…),
// never the raw palette directly. One light theme — a pastel restaurant-SaaS palette
// (lilac-gray canvas, periwinkle primary, soft status tints). The semantic STRUCTURE is
// unchanged from the original blue theme, so the intent behind every token still holds;
// only the values moved to a softer, more pastel register. Dark mode remains a
// documented, deliberate cut for the timebox.

const palette = {
  white: '#ffffff',
  black: '#14151d',
  slate50: '#f5f6fb',
  slate100: '#eef0f4',
  slate200: '#e8e9f1',
  slate300: '#dddced',
  slate400: '#b6b9cc',
  slate500: '#8b8fa4',
  slate600: '#565a6e',
  slate700: '#3a3d4d',
  slate800: '#26283a',
  slate900: '#1d2030',
  // Periwinkle — the pastel primary family (softened from the original blue).
  blue50: '#e9eafb',
  blue500: '#7c83e6',
  blue600: '#5b63d8',
  blue700: '#4b52c9',
  blue800: '#3f46b8',
  green50: '#e6f4ec',
  green500: '#43b37a',
  green600: '#2e975b',
  green700: '#1f8049',
  amber50: '#fbeed6',
  amber500: '#d99a3f',
  amber600: '#b07a2a',
  red50: '#fbe4e8',
  red500: '#e0637a',
  red600: '#cf4f63',
  red700: '#b23c50',
  violet500: '#7a54cf',
} as const;

export const colors = {
  palette,

  surface: {
    base: palette.white,
    raised: palette.slate50,
    sunken: palette.slate100,
    inverse: palette.slate900,
    overlay: 'rgba(29, 32, 48, 0.45)',
  },
  text: {
    primary: palette.slate900,
    secondary: palette.slate600,
    muted: palette.slate500,
    inverse: palette.white,
    link: palette.blue600,
  },
  border: {
    subtle: palette.slate200,
    default: palette.slate300,
    strong: palette.slate400,
    focus: palette.blue600,
  },
  interactive: {
    primary: palette.blue600,
    primaryHover: palette.blue700,
    primaryActive: palette.blue800,
    disabledBg: palette.slate200,
    disabledText: palette.slate400,
  },
  // Semantic status → used by Badge, Toast, StateViews, KPI accents. Inks are the
  // pastel-theme "on-soft" foregrounds (readable on their matching statusSoft tint).
  status: {
    pending: palette.amber600,
    accepted: '#3f61c4',
    preparing: palette.violet500,
    ready: palette.green600,
    completed: palette.green700,
    cancelled: '#71768a',
    success: palette.green600,
    warning: palette.amber600,
    danger: palette.red600,
    info: '#3f61c4',
    neutral: '#71768a',
  },
  // Soft tints for badge/toast/callout backgrounds.
  statusSoft: {
    success: '#d7f0e0',
    warning: palette.amber50,
    danger: palette.red50,
    info: '#e2e9fb',
    neutral: '#e8e9f0',
  },
  // Pastel KPI washes — the four attention-grabbing stat cards on Home. `wash` is the
  // card background, `washTile` the icon chip, `washInk` the icon/foreground color.
  wash: {
    lavender: '#edeefb',
    mint: '#e6f4ec',
    peach: '#fcf1e2',
    gold: '#f7f1dc',
  },
  washTile: {
    lavender: '#e0e2fa',
    mint: '#d3edde',
    peach: '#fbe4c9',
    gold: '#f2e6bf',
  },
  washInk: {
    lavender: '#5b63d8',
    mint: '#2e975b',
    peach: '#b07a2a',
    gold: '#a9862c',
  },
  focusRing: 'rgba(91, 99, 216, 0.35)',
} as const;

export type Colors = typeof colors;
