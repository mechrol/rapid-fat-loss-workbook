import { readFileSync } from 'node:fs';
import { pool } from './pool.js';

export async function migrate(): Promise<void> {
  const sql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
  await pool.query(sql);
}

if (process.argv[1]?.endsWith('migrate.ts')) {
  migrate()
    .then(() => {
      console.log('Migration complete.');
      return pool.end();
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
