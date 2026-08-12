// THROWAWAY pipeline proof for Phase 1: renders real Postgres rows through a
// GENERATED hook (no raw fetch, no hand-written DTO). Folded into the real Menu
// page in Phase 2 — do not ship as-is.
import { View, Text, StyleSheet } from 'react-native';
import { useListMenuCategories } from '@odyssey/api-client';

export default function DebugCategories() {
  const { data, isLoading, error } = useListMenuCategories();
  const categories = data?.data;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu categories (live)</Text>
      {isLoading ? <Text testID="state-loading">Loading…</Text> : null}
      {error ? <Text testID="state-error">Error: {String(error)}</Text> : null}
      {categories?.map((category) => (
        <Text key={category.id} testID="category-row" style={styles.row}>
          {category.name} · #{category.sortOrder}
        </Text>
      ))}
      {categories?.length === 0 ? <Text testID="state-empty">No categories yet.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  row: { fontSize: 16 },
});
