import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../db/pool.js';
import type { ResultRecord, ResultSectionRecord, ResultStatus } from './types.js';

export interface CreateResultInput {
  projectId: string;
  idempotencyKey: string;
  generationSource: 'deterministic' | 'ai';
  sections: { title: string; bullets: string[] }[];
}

export const processingRepository = {
  async findResultByProject(projectId: string): Promise<ResultRecord | null> {
    const { rows } = await pool.query<ResultRecord>(
      `SELECT id, project_id AS "projectId", status, generation_source AS "generationSource",
              idempotency_key AS "idempotencyKey", generated_at AS "generatedAt"
         FROM results WHERE project_id = $1`,
      [projectId],
    );
    return rows[0] ?? null;
  },

  async findResultByKey(projectId: string, idempotencyKey: string): Promise<ResultRecord | null> {
    const { rows } = await pool.query<ResultRecord>(
      `SELECT id, project_id AS "projectId", status, generation_source AS "generationSource",
              idempotency_key AS "idempotencyKey", generated_at AS "generatedAt"
         FROM results WHERE project_id = $1 AND idempotency_key = $2`,
      [projectId, idempotencyKey],
    );
    return rows[0] ?? null;
  },

  async createResultWithSections(client: PoolClient, input: CreateResultInput): Promise<ResultRecord> {
    const { rows } = await client.query<ResultRecord>(
      `INSERT INTO results (project_id, status, generation_source, idempotency_key)
       VALUES ($1, 'draft', $2, $3)
       RETURNING id, project_id AS "projectId", status, generation_source AS "generationSource",
                 idempotency_key AS "idempotencyKey", generated_at AS "generatedAt"`,
      [input.projectId, input.generationSource, input.idempotencyKey],
    );
    const result = rows[0];

    for (let i = 0; i < input.sections.length; i += 1) {
      const s = input.sections[i];
      await client.query(
        `INSERT INTO result_sections (result_id, order_index, title, bullets)
         VALUES ($1, $2, $3, $4)`,
        [result.id, i, s.title, JSON.stringify(s.bullets)],
      );
    }
    return result;
  },

  async createResultWithSectionsTx(input: CreateResultInput): Promise<ResultRecord> {
    return withTransaction((client) => processingRepository.createResultWithSections(client, input));
  },

  async listSections(resultId: string): Promise<ResultSectionRecord[]> {
    const { rows } = await pool.query<ResultSectionRecord>(
      `SELECT id, result_id AS "resultId", order_index AS "orderIndex", title, bullets,
              regenerated_at AS "regeneratedAt"
         FROM result_sections WHERE result_id = $1 ORDER BY order_index ASC`,
      [resultId],
    );
    return rows;
  },

  async updateSection(resultId: string, sectionId: string, bullets: string[]): Promise<ResultSectionRecord | null> {
    const { rows } = await pool.query<ResultSectionRecord>(
      `UPDATE result_sections
          SET bullets = $3, regenerated_at = now()
        WHERE result_id = $1 AND id = $2
        RETURNING id, result_id AS "resultId", order_index AS "orderIndex", title, bullets,
                  regenerated_at AS "regeneratedAt"`,
      [resultId, sectionId, JSON.stringify(bullets)],
    );
    return rows[0] ?? null;
  },

  async setResultStatus(resultId: string, status: ResultStatus): Promise<ResultRecord | null> {
    const { rows } = await pool.query<ResultRecord>(
      `UPDATE results SET status = $2 WHERE id = $1
       RETURNING id, project_id AS "projectId", status, generation_source AS "generationSource",
                 idempotency_key AS "idempotencyKey", generated_at AS "generatedAt"`,
      [resultId, status],
    );
    return rows[0] ?? null;
  },
};
