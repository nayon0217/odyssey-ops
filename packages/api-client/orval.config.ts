import { defineConfig } from 'orval';

// Reads the OpenAPI document emitted by the backend (`pnpm --filter backend gen:contract`)
// and generates fully-typed React Query hooks + models into ./src/generated.
// Generated files are committed but never hand-edited.
export default defineConfig({
  odyssey: {
    input: {
      target: '../../services/backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated',
      schemas: './src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      indexFiles: true,
      override: {
        mutator: {
          path: './src/mutator.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
