import bcrypt from 'bcryptjs';
import { pool } from '../../db/pool.js';
import { conflict, unauthorized } from '../../lib/http.js';
import { signToken } from '../../middleware/auth.js';
import type { AuthResponse, LoginInput, RegisterInput, UserRecord } from './types.js';
import { toPublicUser } from './types.js';

const SALT_ROUNDS = 10;

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw conflict('An account with this email already exists');
    }

    const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const { rows } = await pool.query<UserRecord>(
      `INSERT INTO users (email, display_name, role, password_hash)
       VALUES ($1, $2, 'user', $3)
       RETURNING id, email, display_name, role, created_at`,
      [input.email.toLowerCase(), input.display_name ?? null, hash],
    );

    const user = rows[0];
    return { token: signToken(user), user: toPublicUser(user) };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { rows } = await pool.query<UserRecord & { password_hash: string }>(
      `SELECT id, email, display_name, role, created_at, password_hash
         FROM users WHERE email = $1`,
      [input.email.toLowerCase()],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      throw unauthorized('Invalid email or password');
    }
    return { token: signToken(user), user: toPublicUser(user) };
  },

  async logout(): Promise<void> {
    // No server session to invalidate (AR-1).
  },

  async me(userId: string) {
    const { rows } = await pool.query<UserRecord>(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = $1',
      [userId],
    );
    if (rows.length === 0) throw unauthorized('Account no longer exists');
    return toPublicUser(rows[0]);
  },
};
