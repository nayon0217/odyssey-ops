import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import { Row } from './Box';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateViews';
import type { PressableState } from './Button';

export type ColumnAlign = 'left' | 'center' | 'right';

export type Column<T> = {
  key: string;
  header: string;
  width?: number | string;
  align?: ColumnAlign;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowPress?: (row: T) => void;
  testID?: string;
};

const JUSTIFY_FOR_ALIGN: Record<ColumnAlign, ViewStyle['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

function cellStyle(column: Pick<Column<unknown>, 'width' | 'align'>): ViewStyle {
  return {
    width: column.width as DimensionValue | undefined,
    flex: column.width == null ? 1 : undefined,
    justifyContent: JUSTIFY_FOR_ALIGN[column.align ?? 'left'],
  };
}

function cellContent<T>(column: Column<T>, row: T): ReactNode {
  if (column.render) return column.render(row);
  if (column.accessor) return column.accessor(row);
  const value = (row as Record<string, unknown>)[column.key];
  return value == null ? '' : String(value);
}

const SKELETON_ROW_COUNT = 5;

/** Generic, horizontally-scrollable data table with loading/empty states and row press feedback. */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onRowPress,
  testID,
}: TableProps<T>) {
  const isEmpty = !isLoading && data.length === 0;

  return (
    <ScrollView horizontal testID={testID} showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.table}>
        <Row style={styles.headerRow}>
          {columns.map((column) => (
            <View key={column.key} style={cellStyle(column)}>
              <Text variant="overline" color="secondary">
                {column.header}
              </Text>
            </View>
          ))}
        </Row>

        {isLoading
          ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Row key={i} style={styles.row}>
                {columns.map((column) => (
                  <View key={column.key} style={cellStyle(column)}>
                    <Skeleton height={14} width={column.align === 'left' || !column.align ? '70%' : '40%'} />
                  </View>
                ))}
              </Row>
            ))
          : null}

        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <EmptyState title={emptyTitle ?? 'Nothing here yet'} description={emptyDescription} />
          </View>
        ) : null}

        {!isLoading && !isEmpty
          ? data.map((row, index) => {
              const key = keyExtractor(row, index);
              const cells = columns.map((column) => {
                const content = cellContent(column, row);
                const isPrimitive = typeof content === 'string' || typeof content === 'number';
                return (
                  <View key={column.key} style={cellStyle(column)}>
                    {isPrimitive ? (
                      <Text variant="body" align={column.align === 'left' || !column.align ? undefined : column.align}>
                        {content}
                      </Text>
                    ) : (
                      content
                    )}
                  </View>
                );
              });

              if (onRowPress) {
                return (
                  <Pressable
                    key={key}
                    onPress={() => onRowPress(row)}
                    testID={testID ? `${testID}-row-${key}` : undefined}
                    style={(rawState) => {
                      const { pressed, hovered } = rawState as PressableState;
                      return [
                        styles.row,
                        styles.rowFlex,
                        {
                          backgroundColor: pressed
                            ? tokens.colors.surface.sunken
                            : hovered
                              ? tokens.colors.surface.raised
                              : 'transparent',
                        },
                      ];
                    }}
                  >
                    {cells}
                  </Pressable>
                );
              }

              return (
                <Row key={key} style={styles.row} testID={testID ? `${testID}-row-${key}` : undefined}>
                  {cells}
                </Row>
              );
            })
          : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  table: {
    minWidth: '100%',
  },
  headerRow: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderBottomWidth: tokens.border.hairline,
    borderBottomColor: tokens.colors.border.subtle,
    gap: tokens.spacing.md,
  },
  row: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderBottomWidth: tokens.border.hairline,
    borderBottomColor: tokens.colors.border.subtle,
    gap: tokens.spacing.md,
  },
  rowFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyWrap: {
    minWidth: '100%',
  },
});
