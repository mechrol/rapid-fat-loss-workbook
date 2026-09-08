import { z } from 'zod';

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';
export type GenerationSource = 'deterministic' | 'ai';
export type ResultStatus = 'draft' | 'approved';

export interface ResultRecord {
  id: string;
  projectId: string;
  status: ResultStatus;
  generationSource: GenerationSource;
  idempotencyKey: string;
  generatedAt: Date;
}

export interface ResultSectionRecord {
  id: string;
  resultId: string;
  orderIndex: number;
  title: string;
  bullets: string[];
  regeneratedAt: Date | null;
}

export interface ResultWithSections {
  result: ResultRecord;
  sections: ResultSectionRecord[];
}

export const patchSectionSchema = z.object({
  bullets: z.array(z.string().max(1000)).max(60),
});

export function toResultDto(r: ResultRecord) {
  return {
    id: r.id,
    projectId: r.projectId,
    status: r.status,
    generationSource: r.generationSource,
    generatedAt: r.generatedAt.toISOString(),
  };
}

export function toSectionDto(s: ResultSectionRecord) {
  return {
    id: s.id,
    orderIndex: s.orderIndex,
    title: s.title,
    bullets: s.bullets,
    regeneratedAt: s.regeneratedAt?.toISOString() ?? null,
  };
}
