import type { Pool, PoolClient } from 'pg';
import { pool } from '../../db/pool.js';
import type { InputRecord, Paginated, ProjectRecord } from './types.js';

export const projectsRepository = {
  async listByOwner(ownerId: string, page: number, pageSize: number): Promise<Paginated<ProjectRecord>> {
    const offset = (page - 1) * pageSize;
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM projects WHERE owner_id = $1', [ownerId]);
    const total = countRes.rows[0].total as number;

    const { rows } = await pool.query<ProjectRecord>(
      `SELECT id, owner_id AS "ownerId", name, engine_id AS "engineId", status,
              created_at AS "createdAt", updated_at AS "updatedAt"
         FROM projects
        WHERE owner_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
      [ownerId, pageSize, offset],
    );
    return { items: rows, total, page, pageSize };
  },

  async findOwned(ownerId: string, projectId: string): Promise<ProjectRecord | null> {
    const { rows } = await pool.query<ProjectRecord>(
      `SELECT id, owner_id AS "ownerId", name, engine_id AS "engineId", status,
              created_at AS "createdAt", updated_at AS "updatedAt"
         FROM projects
        WHERE id = $1 AND owner_id = $2`,
      [projectId, ownerId],
    );
    return rows[0] ?? null;
  },

  async create(ownerId: string, name: string, engineId: string): Promise<ProjectRecord> {
    const { rows } = await pool.query<ProjectRecord>(
      `INSERT INTO projects (owner_id, name, engine_id)
       VALUES ($1, $2, $3)
       RETURNING id, owner_id AS "ownerId", name, engine_id AS "engineId", status,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [ownerId, name, engineId],
    );
    return rows[0];
  },

  async deleteOwned(ownerId: string, projectId: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1 AND owner_id = $2', [projectId, ownerId]);
    return (rowCount ?? 0) > 0;
  },

  async upsertInput(client: Pool | PoolClient, projectId: string, stepKey: string, payload: unknown): Promise<InputRecord> {
    const { rows } = await client.query<InputRecord>(
      `INSERT INTO input_records (project_id, step_key, payload)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, step_key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()
       RETURNING id, project_id AS "projectId", step_key AS "stepKey", payload, updated_at AS "updatedAt"`,
      [projectId, stepKey, JSON.stringify(payload)],
    );
    return rows[0];
  },

  async listInput(projectId: string): Promise<InputRecord[]> {
    const { rows } = await pool.query<InputRecord>(
      `SELECT id, project_id AS "projectId", step_key AS "stepKey", payload, updated_at AS "updatedAt"
         FROM input_records WHERE project_id = $1 ORDER BY updated_at ASC`,
      [projectId],
    );
    return rows;
  },
};
