import { randomUUID } from 'node:crypto';
import { config } from '../../config.js';
import { notFound } from '../../lib/http.js';
import { projectsRepository } from '../projects/repository.js';
import { engineRegistry } from './engines/registry.js';
import type { WorkbookAnswers } from './engines/types.js';
import { createQueue } from './queue.js';
import { processingRepository } from './repository.js';
import type { JobStatus, ResultRecord, ResultSectionRecord, ResultWithSections } from './types.js';
import { toResultDto } from './types.js';

const queue = createQueue(config.processingConcurrency);
const latestJobByProject = new Map<string, string>();

const ANSWER_FIELDS = [
  'motivation', 'motivationOther', 'activity', 'habits', 'obstacles', 'obstaclesOther', 'style', 'vision', 'extra',
] as const;

const DEFAULT_ANSWERS: WorkbookAnswers = {
  motivation: [], motivationOther: '', activity: '', habits: [], obstacles: [], obstaclesOther: '', style: '', vision: '', extra: '',
};

function assembleAnswers(records: { stepKey: string; payload: unknown }[]): WorkbookAnswers {
  const answers: WorkbookAnswers = { ...DEFAULT_ANSWERS, motivation: [], habits: [], obstacles: [] };
  for (const record of records) {
    if (!(ANSWER_FIELDS as readonly string[]).includes(record.stepKey)) continue;
    const value = (record.payload as { value?: unknown } | null)?.value;
    (answers as unknown as Record<string, unknown>)[record.stepKey] = value;
  }
  return answers;
}

export const processingService = {
  async process(ownerId: string, projectId: string, idempotencyKey: string) {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');

    const existing = await processingRepository.findResultByKey(projectId, idempotencyKey);
    if (existing) {
      return { jobId: null as string | null, status: 'done' as JobStatus, result: toResultDto(existing) };
    }

    const jobId = randomUUID();
    latestJobByProject.set(projectId, jobId);

    queue.enqueue(jobId, async () => {
      const records = await projectsRepository.listInput(projectId);
      const answers = assembleAnswers(records);
      const engine = engineRegistry[project.engineId];
      const validation = engine.validateAnswers(answers);
      if (!validation.valid) {
        throw new Error(validation.errors?.join('; ') ?? 'Invalid answers');
      }
      const sections = engine.generate(answers);
      await processingRepository.createResultWithSectionsTx({
        projectId, idempotencyKey, generationSource: 'deterministic', sections,
      });
    });

    return { jobId, status: 'queued' as JobStatus, result: null };
  },

  async status(ownerId: string, projectId: string): Promise<{ status: JobStatus; errorMessage?: string }> {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');

    const result = await processingRepository.findResultByProject(projectId);
    if (result) return { status: 'done' };

    const jobId = latestJobByProject.get(projectId);
    if (jobId) {
      const job = queue.get(jobId);
      if (job) return { status: job.status, errorMessage: job.errorMessage };
    }
    return { status: 'queued' };
  },

  async getResult(ownerId: string, projectId: string): Promise<ResultWithSections | null> {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');

    const result = await processingRepository.findResultByProject(projectId);
    if (!result) return null;
    const sections = await processingRepository.listSections(result.id);
    return { result, sections };
  },

  async patchSection(ownerId: string, projectId: string, sectionId: string, bullets: string[]): Promise<ResultSectionRecord> {
    const result = await this.getResult(ownerId, projectId);
    if (!result) throw notFound('Result not found');
    const updated = await processingRepository.updateSection(result.result.id, sectionId, bullets);
    if (!updated) throw notFound('Section not found');
    return updated;
  },

  async regenerateSection(ownerId: string, projectId: string, sectionId: string): Promise<ResultSectionRecord> {
    const result = await this.getResult(ownerId, projectId);
    if (!result) throw notFound('Result not found');

    const section = result.sections.find((s) => s.id === sectionId);
    if (!section) throw notFound('Section not found');

    const project = await projectsRepository.findOwned(ownerId, projectId);
    const engine = engineRegistry[project!.engineId];
    const records = await projectsRepository.listInput(projectId);
    const answers = assembleAnswers(records);
    const fresh = engine.generate(answers)[section.orderIndex];

    const updated = await processingRepository.updateSection(result.result.id, sectionId, fresh ? fresh.bullets : section.bullets);
    if (!updated) throw notFound('Section not found');
    return updated;
  },

  async approve(ownerId: string, projectId: string): Promise<ResultRecord> {
    const result = await this.getResult(ownerId, projectId);
    if (!result) throw notFound('Result not found');
    const updated = await processingRepository.setResultStatus(result.result.id, 'approved');
    return updated ?? result.result;
  },

  async unapprove(ownerId: string, projectId: string): Promise<ResultRecord> {
    const result = await this.getResult(ownerId, projectId);
    if (!result) throw notFound('Result not found');
    const updated = await processingRepository.setResultStatus(result.result.id, 'draft');
    return updated ?? result.result;
  },
};

export { toResultDto };
