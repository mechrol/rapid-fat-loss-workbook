import type { WorkbookEngine } from './types.js';
import { rapidFatLossEngine } from './rapid-fat-loss-v1.js';

export const engineRegistry: Record<string, WorkbookEngine> = {
  'rapid-fat-loss-v1': rapidFatLossEngine,
};
