export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export type ProjectStatus = 'draft' | 'approved';

export interface ProjectDto {
  id: string;
  name: string;
  engineId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InputRecord {
  id: string;
  projectId: string;
  stepKey: string;
  payload: unknown;
  updatedAt: string;
}

export interface ResultSectionDto {
  id: string;
  orderIndex: number;
  title: string;
  bullets: string[];
  regeneratedAt: string | null;
}

export interface ResultDto {
  id: string;
  projectId: string;
  status: ProjectStatus;
  generationSource: 'deterministic' | 'ai';
  generatedAt: string;
}

export interface ResultWithSections {
  result: ResultDto;
  sections: ResultSectionDto[];
}

export interface ProcessOutcome {
  jobId: string | null;
  status: 'queued' | 'processing' | 'done' | 'error';
  result: ResultDto | null;
}

export interface AdminMetrics {
  totalUsers: number;
  totalProjects: number;
  approvedProjects: number;
  projectsLast7d: number;
}

export interface WorkbookAnswers {
  motivation: string[];
  motivationOther: string;
  activity: string;
  habits: string[];
  obstacles: string[];
  obstaclesOther: string;
  style: string;
  vision: string;
  extra: string;
}

export const BLANK_ANSWERS: WorkbookAnswers = {
  motivation: [],
  motivationOther: '',
  activity: '',
  habits: [],
  obstacles: [],
  obstaclesOther: '',
  style: '',
  vision: '',
  extra: '',
};
