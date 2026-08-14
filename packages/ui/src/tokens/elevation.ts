// Radius, border widths, shadows/elevation, z-index, and motion timings.

export const radius = {
  none: 0,
  sm: 7,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  full: 9999,
} as const;

export const border = {
  hairline: 1,
  thin: 1,
  thick: 2,
} as const;

// Shadows map to boxShadow on web (RN-web) and elevation on Android.
// Bigger surfaces read as "thicker": deeper blur + softer, larger shadow.
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#231f52',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#231f52',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#231f52',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

export const zIndex = {
  base: 0,
  nav: 10,
  sticky: 20,
  drawer: 40,
  overlay: 50,
  modal: 60,
  dropdown: 70,
  toast: 80,
} as const;

// Apple-style default: critically damped, brief. Kept as easing/duration since RN-web
// animates via timing; use the short durations for instant-feeling feedback.
export const motion = {
  duration: { instant: 90, fast: 140, base: 200, slow: 280 },
  easing: {
    // critically-damped-ish standard curve; mirror for reversible transitions
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1.1)',
  },
} as const;

export type Radius = typeof radius;
export type Shadow = typeof shadow;
