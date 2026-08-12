import { View, Text, StyleSheet } from 'react-native';
import { APP_NAME } from '@odyssey/shared';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>Phase 0 skeleton — Expo Router web boots.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, color: '#666' },
});
