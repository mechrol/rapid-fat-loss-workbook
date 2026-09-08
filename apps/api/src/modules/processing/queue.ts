import type { JobStatus } from './types.js';

export interface QueueJob {
  id: string;
  status: JobStatus;
  errorMessage?: string;
}

type Handler = () => Promise<void>;

const jobs = new Map<string, QueueJob>();
const pending: { id: string; handler: Handler }[] = [];
let active = 0;

export function createQueue(concurrency: number) {
  function pump(): void {
    while (active < concurrency && pending.length > 0) {
      const next = pending.shift()!;
      active += 1;
      const job = jobs.get(next.id)!;
      job.status = 'processing';
      next
        .handler()
        .then(() => {
          job.status = 'done';
        })
        .catch((err: unknown) => {
          job.status = 'error';
          job.errorMessage = err instanceof Error ? err.message : 'Processing failed';
        })
        .finally(() => {
          active -= 1;
          pump();
        });
    }
  }

  function enqueue(id: string, handler: Handler): QueueJob {
    const job: QueueJob = { id, status: 'queued' };
    jobs.set(id, job);
    pending.push({ id, handler });
    pump();
    return job;
  }

  function get(id: string): QueueJob | undefined {
    return jobs.get(id);
  }

  return { enqueue, get };
}
