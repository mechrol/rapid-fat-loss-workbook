import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool } from '../../db/pool.js';
import { projectsRepository } from './repository.js';

// Cross-user isolation integration test (PRD 8.2, AR-3). Requires a reachable
// PostgreSQL; skipped automatically when DATABASE_URL is absent.
const canReachDb = process.env.DATABASE_URL || process.env.CI;
const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';

describe.skipIf(!canReachDb)('projects ownership (integration)', () => {
  let projectId: string;

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO users (id, email, role, password_hash) VALUES
        ($1, 'owner-a@test', 'user', 'x'), ($2, 'owner-b@test', 'user', 'x')
       ON CONFLICT (id) DO NOTHING`,
      [A, B],
    );
    const p = await projectsRepository.create(A, 'A project', 'rapid-fat-loss-v1');
    projectId = p.id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [A, B]);
    await pool.end();
  });

  it('owner can read their own project', async () => {
    const p = await projectsRepository.findOwned(A, projectId);
    expect(p).not.toBeNull();
    expect(p!.ownerId).toBe(A);
  });

  it('user B cannot read user A project (SQL-layer WHERE owner_id)', async () => {
    expect(await projectsRepository.findOwned(B, projectId)).toBeNull();
  });

  it('user B cannot delete user A project', async () => {
    expect(await projectsRepository.deleteOwned(B, projectId)).toBe(false);
    expect(await projectsRepository.findOwned(A, projectId)).not.toBeNull();
  });

  it('list is scoped to owner', async () => {
    const list = await projectsRepository.listByOwner(B, 1, 20);
    expect(list.items.find((p) => p.id === projectId)).toBeUndefined();
  });
});
