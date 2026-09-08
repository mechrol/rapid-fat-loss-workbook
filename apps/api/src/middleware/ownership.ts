import type { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import { forbidden, notFound } from '../lib/http.js';
import { asyncHandler } from '../lib/http.js';

export const requireOwnership = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const projectId = req.params.id;
    const userId = req.user!.id;

    const { rows } = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (rows.length === 0) {
      throw notFound('Project not found');
    }
    if (rows[0].owner_id !== userId) {
      throw forbidden('You do not have access to this project');
    }
    next();
  },
);
