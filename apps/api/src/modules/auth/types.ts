import { z } from 'zod';

export type Role = 'user' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
}

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  display_name: z.string().trim().max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export function toPublicUser(u: UserRecord): PublicUser {
  return { id: u.id, email: u.email, displayName: u.displayName, role: u.role };
}
