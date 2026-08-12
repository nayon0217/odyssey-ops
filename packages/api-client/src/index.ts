// @odyssey/api-client — public surface.
// Re-exports the Orval-generated hooks/models plus the shared fetch mutator.
// NOTE: everything under ./generated is produced by `pnpm gen:client` and is never
// hand-edited. This barrel lives outside ./generated because Orval cleans that folder.
export * from './mutator';

// Generated React Query hooks (one export line per OpenAPI tag).
export * from './generated/menu/menu';

// Generated models/types.
export * from './generated/model';
