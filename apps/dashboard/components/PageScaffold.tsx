import type { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TopBar, tokens } from '@odyssey/ui';

// Standard page frame: a fixed TopBar, a scrollable content column, and an `overlay`
// slot rendered OUTSIDE the ScrollView (so modals/drawers escape the scroll container).
export function PageScaffold({
  title,
  subtitle,
  actions,
  overlay,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.root}>
      <TopBar title={title} subtitle={subtitle} right={actions} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.surface.raised },
  scroll: { flex: 1 },
  content: {
    padding: tokens.layout.gutter,
    gap: tokens.spacing.xl,
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    alignSelf: 'center',
  },
});
