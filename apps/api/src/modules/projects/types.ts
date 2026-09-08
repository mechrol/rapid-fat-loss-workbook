import { z } from 'zod';

export type ProjectStatus = 'draft' | 'approved';

export interface ProjectRecord {
  id: string;
  ownerId: string;
  name: string;
  engineId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDto {
  id: string;
  name: string;
  engineId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InputRecord {
  id: string;
  projectId: string;
  stepKey: string;
  payload: unknown;
  updatedAt: Date;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  engineId: z.string().trim().min(1).max(80).optional(),
});

export const inputPayloadSchema = z.object({
  payload: z.record(z.unknown()),
});

export function toProjectDto(p: ProjectRecord): ProjectDto {
  return {
    id: p.id,
    name: p.name,
    engineId: p.engineId,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
