import { pool } from '../../db/pool.js';
import { notFound } from '../../lib/http.js';
import { engineRegistry } from '../processing/engines/registry.js';
import { projectsRepository } from './repository.js';
import type { InputRecord, Paginated, ProjectDto } from './types.js';
import { toProjectDto } from './types.js';

const DEFAULT_NAME = 'Untitled workbook';

function resolveEngine(engineId?: string): string {
  const id = engineId ?? 'rapid-fat-loss-v1';
  if (!engineRegistry[id]) throw notFound(`Unknown workbook engine: ${id}`);
  return id;
}

export const projectsService = {
  async list(ownerId: string, page: number, pageSize: number): Promise<Paginated<ProjectDto>> {
    const result = await projectsRepository.listByOwner(ownerId, page, pageSize);
    return { ...result, items: result.items.map(toProjectDto) };
  },

  async create(ownerId: string, name?: string, engineId?: string): Promise<ProjectDto> {
    const resolvedEngine = resolveEngine(engineId);
    const record = await projectsRepository.create(ownerId, name ?? DEFAULT_NAME, resolvedEngine);
    return toProjectDto(record);
  },

  async get(ownerId: string, projectId: string): Promise<ProjectDto> {
    const record = await projectsRepository.findOwned(ownerId, projectId);
    if (!record) throw notFound('Project not found');
    return toProjectDto(record);
  },

  async remove(ownerId: string, projectId: string): Promise<void> {
    const deleted = await projectsRepository.deleteOwned(ownerId, projectId);
    if (!deleted) throw notFound('Project not found');
  },

  async saveInput(ownerId: string, projectId: string, stepKey: string, payload: unknown): Promise<InputRecord> {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');
    const record = await projectsRepository.upsertInput(pool, projectId, stepKey, payload);
    return record;
  },

  async listInput(ownerId: string, projectId: string): Promise<InputRecord[]> {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');
    return projectsRepository.listInput(projectId);
  },
};
