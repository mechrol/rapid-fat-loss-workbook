import { projectsRepository } from '../projects/repository.js';
import { processingService } from '../processing/service.js';
import { notFound } from '../../lib/http.js';

export type ExportFormat = 'markdown' | 'json';

export const exportService = {
  async build(ownerId: string, projectId: string, format: ExportFormat): Promise<{ filename: string; contentType: string; body: string }> {
    const project = await projectsRepository.findOwned(ownerId, projectId);
    if (!project) throw notFound('Project not found');

    const result = await processingService.getResult(ownerId, projectId);
    if (!result) throw notFound('No result to export yet');

    const safeName = (project.name || 'workbook').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const sections = result.sections;

    if (format === 'json') {
      const payload = {
        project: project.name,
        status: result.result.status,
        generatedAt: result.result.generatedAt.toISOString(),
        sections: sections.map((s) => ({ title: s.title, bullets: s.bullets })),
      };
      return { filename: `${safeName}.json`, contentType: 'application/json', body: JSON.stringify(payload, null, 2) };
    }

    let out = `# ${project.name}\n\n`;
    for (const section of sections) {
      out += `## ${section.title}\n`;
      for (const bullet of section.bullets.filter((b) => b && b.trim())) {
        out += `- ${bullet}\n`;
      }
      out += '\n';
    }
    return { filename: `${safeName}.md`, contentType: 'text/markdown; charset=utf-8', body: out };
  },
};
