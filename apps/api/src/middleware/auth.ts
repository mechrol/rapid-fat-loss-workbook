import type { NextFunction, Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config.js';
import { unauthorized } from '../lib/http.js';

export interface AuthUser {
  id: string;
  role: 'user' | 'admin';
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
  role: 'user' | 'admin';
  email: string;
}

export function signToken(user: { id: string; role: string; email: string }): string {
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role as 'user' | 'admin',
    email: user.email,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }
  try {
    const payload = jwt.verify(header.slice('Bearer '.length), config.jwtSecret) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(unauthorized('Admin role required'));
    return;
  }
  next();
}
