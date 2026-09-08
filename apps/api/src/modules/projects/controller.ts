import { Router } from 'express';
import { asyncHandler, badRequest } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireOwnership } from '../../middleware/ownership.js';
import { projectsService } from './service.js';
import { createProjectSchema, inputPayloadSchema } from './types.js';

export const projectsController = Router();

projectsController.use(requireAuth);

projectsController.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize ?? '20'), 10) || 20));
    res.json(await projectsService.list(req.user!.id, page, pageSize));
  }),
);

projectsController.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    res.status(201).json(await projectsService.create(req.user!.id, parsed.data.name, parsed.data.engineId));
  }),
);

projectsController.get(
  '/:id',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await projectsService.get(req.user!.id, req.params.id));
  }),
);

projectsController.delete(
  '/:id',
  requireOwnership,
  asyncHandler(async (req, res) => {
    await projectsService.remove(req.user!.id, req.params.id);
    res.status(204).end();
  }),
);

projectsController.patch(
  '/:id/input/:stepKey',
  requireOwnership,
  asyncHandler(async (req, res) => {
    const parsed = inputPayloadSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    res.json(await projectsService.saveInput(req.user!.id, req.params.id, req.params.stepKey, parsed.data.payload));
  }),
);

projectsController.get(
  '/:id/input',
  requireOwnership,
  asyncHandler(async (req, res) => {
    res.json(await projectsService.listInput(req.user!.id, req.params.id));
  }),
);
