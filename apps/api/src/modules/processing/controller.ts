import { Router } from 'express';
import { asyncHandler, badRequest } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireOwnership } from '../../middleware/ownership.js';
import { processingService } from './service.js';
import { patchSectionSchema } from './types.js';

export const processingController = Router();

processingController.use(requireAuth);

processingController.post(
  '/:id/process',
  requireOwnership,
  asyncHandler(async (req, res) => {
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      throw badRequest('Missing Idempotency-Key header');
    }
    const outcome = await processingService.process(req.user!.id, req.params.id, idempotencyKey);
    res.status(outcome.status === 'done' ? 200 : 202).json(outcome);
  }),
);

processingController.get(
  '/:id/process/status',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await processingService.status(req.user!.id, req.params.id));
  }),
);

processingController.get(
  '/:id/result',
  requireOwnership,
  asyncHandler(async (req, res) => {
    const result = await processingService.getResult(req.user!.id, req.params.id);
    if (!result) {
      res.status(404).json({ error: { code: 'NO_RESULT', message: 'No result yet' } });
      return;
    }
    res.json({
      result: result.result,
      sections: result.sections.map((s) => ({
        id: s.id, orderIndex: s.orderIndex, title: s.title, bullets: s.bullets, regeneratedAt: s.regeneratedAt?.toISOString() ?? null,
      })),
    });
  }),
);

processingController.patch(
  '/:id/result/sections/:sectionId',
  requireOwnership,
  asyncHandler(async (req, res) => {
    const parsed = patchSectionSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    res.json(await processingService.patchSection(req.user!.id, req.params.id, req.params.sectionId, parsed.data.bullets));
  }),
);

processingController.post(
  '/:id/result/sections/:sectionId/regenerate',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await processingService.regenerateSection(req.user!.id, req.params.id, req.params.sectionId));
  }),
);

processingController.post(
  '/:id/approve',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await processingService.approve(req.user!.id, req.params.id));
  }),
);

processingController.post(
  '/:id/unapprove',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await processingService.unapprove(req.user!.id, req.params.id));
  }),
);
