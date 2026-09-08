import { Router } from 'express';
import { asyncHandler } from '../../lib/http.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { adminService } from './service.js';

export const adminController = Router();

adminController.use(requireAuth, requireAdmin);

adminController.get(
  '/metrics',
  asyncHandler(async (_req, res) => {
    res.json(await adminService.metrics());
  }),
);

adminController.get(
  '/users',
  asyncHandler(async (_req, res) => {
    res.json(await adminService.listUsers());
  }),
);

adminController.delete(
  '/users/:userId',
  asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.userId);
    res.status(204).end();
  }),
);
