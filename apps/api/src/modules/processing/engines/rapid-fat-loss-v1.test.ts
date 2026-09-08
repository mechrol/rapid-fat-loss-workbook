import { describe, expect, it } from 'vitest';
import { rapidFatLossEngine } from './rapid-fat-loss-v1.js';
import type { WorkbookAnswers } from './types.js';

const answers: WorkbookAnswers = {
  motivation: ['Health', 'Energy'],
  motivationOther: 'A trip coming up',
  activity: 'Occasional',
  habits: ['Eat late at night'],
  obstacles: ['Time', 'Cravings'],
  obstaclesOther: '',
  style: 'Structured',
  vision: 'Feel lighter and more consistent',
  extra: '',
};

describe('rapidFatLossEngine', () => {
  it('generates the six sections in a stable order', () => {
    const sections = rapidFatLossEngine.generate(answers);
    expect(sections.map((s) => s.id)).toEqual(['focus', 'principles', 'obstacles', 'practice', 'mindset', 'support']);
    expect(sections).toHaveLength(6);
  });

  it('generateSection returns only the requested section and leaves others untouched', () => {
    const all = rapidFatLossEngine.generate(answers);
    const single = rapidFatLossEngine.generateSection(answers, 'focus');
    expect(single.id).toBe('focus');
    expect(single.bullets).toEqual(all[0].bullets);
    expect(rapidFatLossEngine.generate(answers)[1].bullets).toEqual(all[1].bullets);
  });

  it('validates structurally sound answers', () => {
    expect(rapidFatLossEngine.validateAnswers(answers).valid).toBe(true);
    const bad = { ...answers, motivation: 'not-an-array' } as unknown as WorkbookAnswers;
    expect(rapidFatLossEngine.validateAnswers(bad).valid).toBe(false);
  });

  it('never emits concrete calorie/macro/weight-rate recommendations (PRD 8.5)', () => {
    const text = JSON.stringify(rapidFatLossEngine.generate(answers));
    expect(text).not.toMatch(/\d+\s*(kcal|calorie)/i);
    expect(text).not.toMatch(/\d+\s*(g|grams)\s+(of\s+)?(protein|carb|fat)/i);
    expect(text).not.toMatch(/lose\s+\d+\s*(lbs|pounds|kg)/i);
  });
});
