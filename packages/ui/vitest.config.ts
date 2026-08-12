import { defineConfig } from 'vitest/config';

// Components are React Native primitives; on web they run through react-native-web,
// so tests render them to the DOM (jsdom) with RN aliased to react-native-web.
export default defineConfig({
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
