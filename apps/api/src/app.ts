import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler } from './lib/http.js';
import { authController } from './modules/auth/controller.js';
import { projectsController } from './modules/projects/controller.js';
import { processingController } from './modules/processing/controller.js';
import { exportController } from './modules/export/controller.js';
import { adminController } from './modules/admin/controller.js';

export function createApp(): express.Express {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/v1/health', (_req, res) => {
    res.json({ ok: true, engine: 'rapid-fat-loss-v1', time: new Date().toISOString() });
  });

  app.use('/v1/auth', authController);
  app.use('/v1/projects', projectsController);
  app.use('/v1/projects', processingController);
  app.use('/v1/projects', exportController);
  app.use('/v1/admin', adminController);

  app.use(errorHandler);

  return app;
}
