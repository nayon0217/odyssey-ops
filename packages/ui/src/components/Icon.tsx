import Svg, { Path, Circle, Line, type SvgProps } from 'react-native-svg';
import type { ReactNode } from 'react';
import { tokens } from '../tokens';

// Illustrated line icons — the single icon primitive for the whole app (nav, KPIs,
// callouts, controls). No emoji anywhere in the UI. Geometry is Lucide (ISC-licensed,
// 24×24, 2px round-joined strokes); every glyph inherits `stroke`/`fill` from the parent
// <Svg>, so a single `color` prop tints the icon and it tracks the surrounding text.
export type IconName =
  | 'home'
  | 'orders'
  | 'menu'
  | 'customers'
  | 'settings'
  | 'search'
  | 'bell'
  | 'plus'
  | 'revenue'
  | 'timer'
  | 'flame'
  | 'star'
  | 'arrowUp'
  | 'arrowDown'
  | 'chevronRight'
  | 'check'
  | 'success'
  | 'warning'
  | 'info';

const ICONS: Record<IconName, ReactNode> = {
  home: (
    <>
      <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <Path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  orders: (
    <>
      <Path d="M12 17V7" />
      <Path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
      <Path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
    </>
  ),
  menu: (
    <>
      <Path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <Path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <Path d="m2.1 21.8 6.4-6.3" />
      <Path d="m19 5-7 7" />
    </>
  ),
  customers: (
    <>
      <Path d="M18 21a8 8 0 0 0-16 0" />
      <Circle cx="10" cy="8" r="5" />
      <Path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </>
  ),
  settings: (
    <>
      <Path d="M10 5H3" />
      <Path d="M12 19H3" />
      <Path d="M14 3v4" />
      <Path d="M16 17v4" />
      <Path d="M21 12h-9" />
      <Path d="M21 19h-5" />
      <Path d="M21 5h-7" />
      <Path d="M8 10v4" />
      <Path d="M8 12H3" />
    </>
  ),
  search: (
    <>
      <Path d="m21 21-4.34-4.34" />
      <Circle cx="11" cy="11" r="8" />
    </>
  ),
  bell: (
    <>
      <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </>
  ),
  plus: (
    <>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </>
  ),
  revenue: (
    <>
      <Path d="M13.744 17.736a6 6 0 1 1-7.48-7.48" />
      <Path d="M15 6h1v4" />
      <Path d="m6.134 14.768.866-.5 2 3.464" />
      <Circle cx="16" cy="8" r="6" />
    </>
  ),
  timer: (
    <>
      <Line x1="10" x2="14" y1="2" y2="2" />
      <Line x1="12" x2="15" y1="14" y2="11" />
      <Circle cx="12" cy="14" r="8" />
    </>
  ),
  flame: <Path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />,
  star: (
    <Path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  ),
  arrowUp: (
    <>
      <Path d="m5 12 7-7 7 7" />
      <Path d="M12 19V5" />
    </>
  ),
  arrowDown: (
    <>
      <Path d="M12 5v14" />
      <Path d="m19 12-7 7-7-7" />
    </>
  ),
  chevronRight: <Path d="m9 18 6-6-6-6" />,
  check: <Path d="M20 6 9 17l-5-5" />,
  success: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Path d="m9 12 2 2 4-4" />
    </>
  ),
  warning: (
    <>
      <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <Path d="M12 9v4" />
      <Path d="M12 17h.01" />
    </>
  ),
  info: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 16v-4" />
      <Path d="M12 8h.01" />
    </>
  ),
};

type TextColorToken = keyof typeof tokens.colors.text;

export type IconProps = {
  name: IconName;
  /** Rendered square size in px. Default 20. */
  size?: number;
  /** A text color token (primary/secondary/muted/inverse/link) or a raw color string. */
  color?: TextColorToken | string;
  strokeWidth?: number;
  testID?: string;
  style?: SvgProps['style'];
};

export function Icon({ name, size = 20, color = 'secondary', strokeWidth = 1.8, testID, style }: IconProps) {
  const textColors = tokens.colors.text as Record<string, string>;
  const stroke = textColors[color] ?? color;
  return (
    <Svg
      testID={testID}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {ICONS[name]}
    </Svg>
  );
}
