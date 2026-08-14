import { defineConfig } from 'vitest/config';

// Dashboard unit tests cover pure page-level logic (no RN rendering needed).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'hooks/**/*.test.ts'],
  },
});
