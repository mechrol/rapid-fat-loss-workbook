export interface ResultSectionDraft {
  id: string;
  title: string;
  bullets: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
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

export interface WorkbookEngine {
  id: string;
  displayName: string;
  validateAnswers(answers: WorkbookAnswers): ValidationResult;
  generate(answers: WorkbookAnswers): ResultSectionDraft[];
  generateSection(answers: WorkbookAnswers, sectionId: string): ResultSectionDraft;
}
