import { Router } from 'express';
import { asyncHandler, badRequest } from '../../lib/http.js';
import { requireAuth } from '../../middleware/auth.js';
import { authService } from './service.js';
import { loginSchema, registerSchema } from './types.js';

export const authController = Router();

authController.post(
  '/register',
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    }
    res.status(201).json(await authService.register(parsed.data));
  }),
);

authController.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    }
    res.json(await authService.login(parsed.data));
  }),
);

authController.post('/logout', (_req, res) => {
  res.status(204).end();
});

authController.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await authService.me(req.user!.id));
  }),
);
