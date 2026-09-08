export type StepType = 'chips-multi' | 'chips-single' | 'textarea' | 'mixed-start';

export interface InputStep {
  key: string;
  q: string;
  hint: string;
  type: StepType;
  field?: string;
  options?: string[];
  otherField?: string;
  otherLabel?: string;
}

export const INPUT_STEPS: InputStep[] = [
  { key: 'motivation', q: "What's driving this right now?", hint: 'Choose everything that applies — this shapes your Focus Areas.', type: 'chips-multi', field: 'motivation', options: ['Health', 'Confidence', 'Energy', 'Event', 'Reset'], otherField: 'motivationOther', otherLabel: 'Anything else driving this? (optional)' },
  { key: 'start', q: 'Where are you starting from?', hint: 'Be honest rather than aspirational — the plan adapts either way.', type: 'mixed-start' },
  { key: 'obstacles', q: 'What has gotten in the way before?', hint: "Pick what's actually happened, not what you're worried about.", type: 'chips-multi', field: 'obstacles', options: ['Time', 'Motivation', 'Social', 'Cravings', 'Schedule', 'Plan'], otherField: 'obstaclesOther', otherLabel: "Anything else that's gotten in the way? (optional)" },
  { key: 'style', q: 'How do you want to work?', hint: 'This sets your Operating Principles.', type: 'chips-single', field: 'style', options: ['Structured', 'Flexible', 'Accountability', 'Data'] },
  { key: 'vision', q: 'In 90 days, what does success actually look like?', hint: 'Write it in your own words — this becomes part of your Mindset Notes.', type: 'textarea', field: 'vision' },
  { key: 'extra', q: 'Anything else your workbook should address?', hint: 'Optional — support needs, upcoming events, anything relevant.', type: 'textarea', field: 'extra' },
];

export const OBSTACLE_LABELS: Record<string, string> = {
  Time: 'Time',
  Motivation: 'Motivation dips',
  Social: 'Social situations',
  Cravings: 'Cravings',
  Schedule: 'Inconsistent schedule',
  Plan: 'No clear plan',
};

export const STYLE_LABELS: Record<string, string> = {
  Structured: 'Structured & scheduled',
  Flexible: 'Flexible & intuitive',
  Accountability: 'Accountability-driven',
  Data: 'Data & tracking-driven',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  Sedentary: 'Mostly sedentary',
  Occasional: 'Occasionally active',
  Regular: 'Regularly active',
};

export const HABIT_LABELS: Record<string, string> = {
  'Skip meals often': 'Skip meals often',
  'Eat late at night': 'Eat late at night',
  'Stress eat': 'Stress eat',
  'Structured meals': 'Already fairly structured',
  'Not sure': 'Not sure yet',
};
