// Deterministically emit the OpenAPI document to services/backend/openapi.json
// by building the app instance in Node — no running Worker, no sleep/curl race.
// Orval reads this file to generate the typed client.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from '../src/index';

const app = createApp();

const doc = app.getOpenAPIDocument({
  openapi: '3.0.0',
  info: {
    title: 'Odyssey Ops API',
    version: '0.1.0',
    description: 'Restaurant operations API — menu, orders, customers, settings, metrics.',
  },
});

const outPath = resolve(import.meta.dirname, '../openapi.json');
writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
