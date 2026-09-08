import { Router } from 'express';
import { asyncHandler } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireOwnership } from '../../middleware/ownership.js';
import { exportService, type ExportFormat } from './service.js';

export const exportController = Router();

exportController.use(requireAuth);

exportController.get(
  '/:id/export',
  requireOwnership,
  asyncHandler(async (req, res) => {
    const format = (req.query.format === 'json' ? 'json' : 'markdown') as ExportFormat;
    const { filename, contentType, body } = await exportService.build(req.user!.id, req.params.id, format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  }),
);
