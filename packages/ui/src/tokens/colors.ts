// Color tokens. Components reference the SEMANTIC groups (surface/text/border/…),
// never the raw palette directly. One light theme, crafted for a clean restaurant-SaaS
// feel (Ody-inspired). Dark mode is a documented, deliberate cut for the timebox.

const palette = {
  white: '#ffffff',
  black: '#0b1120',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  blue50: '#eff6ff',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  green50: '#ecfdf5',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  amber50: '#fffbeb',
  amber500: '#f59e0b',
  amber600: '#d97706',
  red50: '#fef2f2',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',
  violet500: '#8b5cf6',
} as const;

export const colors = {
  palette,

  surface: {
    base: palette.white,
    raised: palette.slate50,
    sunken: palette.slate100,
    inverse: palette.slate900,
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  text: {
    primary: palette.slate900,
    secondary: palette.slate600,
    muted: palette.slate400,
    inverse: palette.white,
    link: palette.blue600,
  },
  border: {
    subtle: palette.slate200,
    default: palette.slate300,
    strong: palette.slate400,
    focus: palette.blue500,
  },
  interactive: {
    primary: palette.blue600,
    primaryHover: palette.blue700,
    primaryActive: palette.blue800,
    disabledBg: palette.slate200,
    disabledText: palette.slate400,
  },
  // Semantic status → used by Badge, Toast, StateViews, KPI accents.
  status: {
    pending: palette.amber500,
    accepted: palette.blue500,
    preparing: palette.violet500,
    ready: palette.green500,
    completed: palette.green600,
    cancelled: palette.slate400,
    success: palette.green600,
    warning: palette.amber600,
    danger: palette.red600,
    info: palette.blue600,
    neutral: palette.slate500,
  },
  // Soft tints for badge/toast/callout backgrounds.
  statusSoft: {
    success: palette.green50,
    warning: palette.amber50,
    danger: palette.red50,
    info: palette.blue50,
    neutral: palette.slate100,
  },
  focusRing: 'rgba(37, 99, 235, 0.35)',
} as const;

export type Colors = typeof colors;
