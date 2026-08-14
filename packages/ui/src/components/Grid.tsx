import { Children, isValidElement, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '../tokens';

export type GridProps = {
  children: ReactNode;
  /** Minimum width per cell; the grid fits as many columns as possible, then wraps. */
  minChildWidth?: number;
  gap?: keyof typeof tokens.spacing;
  testID?: string;
};

/** Responsive auto-wrapping grid — the layout/grid-rules primitive. Cells grow to fill
 *  the row and wrap to the next line once they'd fall below `minChildWidth`. */
export function Grid({ children, minChildWidth = 220, gap = 'lg', testID }: GridProps) {
  return (
    <View testID={testID} style={[styles.row, { gap: tokens.spacing[gap] }]}>
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <View key={i} style={{ flexGrow: 1, flexBasis: minChildWidth, minWidth: minChildWidth }}>
            {child}
          </View>
        ) : (
          child
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
