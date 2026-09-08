import type {
  AdminMetrics,
  AuthResponse,
  InputRecord,
  Paginated,
  ProcessOutcome,
  ProjectDto,
  ResultSectionDto,
  ResultWithSections,
  WorkbookAnswers,
} from './types';

const BASE = '/v1';
const TOKEN_KEY = 'rfl.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const body = data as { error?: { code: string; message: string } } | null;
    throw new ApiClientError(res.status, body?.error?.code ?? 'UNKNOWN', body?.error?.message ?? 'Request failed');
  }
  return data as T;
}

export const api = {
  register(email: string, password: string, displayName?: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName }),
    });
  },
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  logout() {
    return request<void>('/auth/logout', { method: 'POST' });
  },
  me() {
    return request<AuthResponse['user']>('/auth/me');
  },
  listProjects(page = 1, pageSize = 20) {
    return request<Paginated<ProjectDto>>(`/projects?page=${page}&pageSize=${pageSize}`);
  },
  createProject(name?: string) {
    return request<ProjectDto>('/projects', { method: 'POST', body: JSON.stringify({ name }) });
  },
  getProject(id: string) {
    return request<ProjectDto>(`/projects/${id}`);
  },
  deleteProject(id: string) {
    return request<void>(`/projects/${id}`, { method: 'DELETE' });
  },
  saveInput(id: string, field: keyof WorkbookAnswers, value: unknown) {
    return request<InputRecord>(`/projects/${id}/input/${field}`, {
      method: 'PATCH',
      body: JSON.stringify({ payload: { value } }),
    });
  },
  listInput(id: string) {
    return request<InputRecord[]>(`/projects/${id}/input`);
  },
  process(id: string, idempotencyKey: string) {
    return request<ProcessOutcome>(`/projects/${id}/process`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
  processStatus(id: string) {
    return request<{ status: ProcessOutcome['status']; errorMessage?: string }>(`/projects/${id}/process/status`);
  },
  getResult(id: string) {
    return request<ResultWithSections>(`/projects/${id}/result`);
  },
  patchSection(id: string, sectionId: string, bullets: string[]) {
    return request<ResultSectionDto>(`/projects/${id}/result/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ bullets }),
    });
  },
  regenerateSection(id: string, sectionId: string) {
    return request<ResultSectionDto>(`/projects/${id}/result/sections/${sectionId}/regenerate`, { method: 'POST' });
  },
  approve(id: string) {
    return request<unknown>(`/projects/${id}/approve`, { method: 'POST' });
  },
  unapprove(id: string) {
    return request<unknown>(`/projects/${id}/unapprove`, { method: 'POST' });
  },
  exportUrl(id: string, format: 'markdown' | 'json' = 'markdown'): string {
    return `${BASE}/projects/${id}/export?format=${format}`;
  },
  adminMetrics() {
    return request<AdminMetrics>('/admin/metrics');
  },
  adminUsers() {
    return request<{ id: string; email: string; display_name: string | null; role: string }[]>('/admin/users');
  },
};
