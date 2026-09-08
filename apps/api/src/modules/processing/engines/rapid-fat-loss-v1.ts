import type { ResultSectionDraft, ValidationResult, WorkbookAnswers, WorkbookEngine } from './types.js';

const MOTIVATION_COPY: Record<string, string> = {
  Health: 'steadier long-term health rather than a quick number on the scale',
  Confidence: 'how you feel moving through your own day',
  Energy: 'having more usable energy for the rest of your life',
  Event: 'being ready for a specific date on your calendar',
  Reset: 'resetting habits that have drifted over time',
};

const OBSTACLE_ADVICE: Record<string, string> = {
  Time: 'Block movement and meal prep into your calendar like meetings you would not cancel — even short ones count.',
  Motivation:
    'Attach the new habit to something you already do daily, so it does not depend on willpower alone.',
  Social:
    'Decide your default choice before you are at the table or the event, not in the moment.',
  Cravings:
    'Keep one planned, satisfying option ready instead of aiming to feel zero cravings.',
  Schedule:
    'Build two or three fixed anchor points a week rather than chasing a perfect daily routine.',
  Plan: 'Use this workbook as the plan itself, and revisit it on the same day each week.',
};

const STYLE_PRINCIPLES: Record<string, string[]> = {
  Structured: [
    'Put meals and movement on the calendar like scheduled appointments.',
    'Review the week ahead on the same day each week and adjust one thing at a time.',
  ],
  Flexible: [
    'Set one loose intention each morning instead of a rigid script.',
    'Notice what worked at the end of the day and carry it forward tomorrow.',
  ],
  Accountability: [
    'Line up one person or check-in point who expects an update from you.',
    'Share your weekly practice out loud, even briefly.',
  ],
  Data: [
    'Pick one or two signals to note daily — sleep, mood, or a habit streak.',
    'Review the trend once a week rather than reacting to daily noise.',
  ],
};

const ACTIVITY_PRACTICE: Record<string, string> = {
  Sedentary:
    'Add one short, low-pressure block of movement to a part of the day you already control.',
  Occasional:
    'Turn your occasional movement into two or three fixed slots per week.',
  Regular:
    'Keep your current movement steady and use it as the anchor the rest of the plan builds around.',
};

const HABIT_ADVICE: Record<string, string> = {
  'Skip meals often':
    'Build one consistent anchor meal you rarely skip, so the rest of the day has a reference point.',
  'Eat late at night':
    'Move your last planned food earlier where you can, and keep a low-effort option ready for genuine late hunger.',
  'Stress eat':
    'Name the trigger before it happens and line up one non-food response for it.',
  'Structured meals':
    'Keep the structure that is already working — this plan builds on it, not around it.',
  'Not sure':
    'Track one week of your normal pattern with no changes, just to see it clearly first.',
};

function buildSections(a: WorkbookAnswers): ResultSectionDraft[] {
  const sections: ResultSectionDraft[] = [];

  const focusBullets: string[] = [];
  (a.motivation.length ? a.motivation : ['Reset']).forEach((m) => {
    if (MOTIVATION_COPY[m]) focusBullets.push('This is really about ' + MOTIVATION_COPY[m] + '.');
  });
  if (a.motivationOther && a.motivationOther.trim()) focusBullets.push(a.motivationOther.trim());
  sections.push({ id: 'focus', title: 'Your Focus Areas', bullets: focusBullets });

  const principleBullets: string[] = [];
  if (a.style && STYLE_PRINCIPLES[a.style]) principleBullets.push(...STYLE_PRINCIPLES[a.style]);
  if (a.activity && ACTIVITY_PRACTICE[a.activity]) principleBullets.push(ACTIVITY_PRACTICE[a.activity]);
  sections.push({
    id: 'principles',
    title: 'Your Operating Principles',
    bullets: principleBullets.length
      ? principleBullets
      : ['Choose one consistent rule to follow this week, and only add a second once it feels automatic.'],
  });

  const obstacleBullets = (a.obstacles || []).map((o) => OBSTACLE_ADVICE[o]).filter(Boolean);
  if (a.obstaclesOther && a.obstaclesOther.trim()) {
    obstacleBullets.push('Also watch for: ' + a.obstaclesOther.trim());
  }
  sections.push({
    id: 'obstacles',
    title: 'Removing What Got In The Way Before',
    bullets: obstacleBullets.length
      ? obstacleBullets
      : ['No specific obstacles noted — revisit this section any time something starts to slip.'],
  });

  const habitBullets = (a.habits || []).map((h) => HABIT_ADVICE[h]).filter(Boolean);
  sections.push({
    id: 'practice',
    title: "This Week's Practice",
    bullets: habitBullets.length
      ? habitBullets
      : ['Pick one small, repeatable action and do it on the same days each week.'],
  });

  const mindsetBullets: string[] = [];
  if (a.vision && a.vision.trim()) {
    mindsetBullets.push('In your own words, success looks like: "' + a.vision.trim() + '"');
  }
  mindsetBullets.push('Progress here is measured in consistency, not in a single number — expect uneven weeks.');
  sections.push({ id: 'mindset', title: 'Mindset Notes', bullets: mindsetBullets });

  const supportBullets = [
    'Decide who, if anyone, will know about this plan.',
    'Decide what you will do the first time a week goes off track.',
  ];
  if (a.extra && a.extra.trim()) supportBullets.push(a.extra.trim());
  sections.push({ id: 'support', title: 'Support Plan', bullets: supportBullets });

  return sections;
}

export const rapidFatLossEngine: WorkbookEngine = {
  id: 'rapid-fat-loss-v1',
  displayName: 'Rapid Fat Loss Framework',

  validateAnswers(a: WorkbookAnswers): ValidationResult {
    const errors: string[] = [];
    if (!Array.isArray(a.motivation)) errors.push('motivation must be an array');
    if (typeof a.style !== 'string') errors.push('style must be a string');
    return errors.length ? { valid: false, errors } : { valid: true };
  },

  generate(a: WorkbookAnswers): ResultSectionDraft[] {
    return buildSections(a);
  },

  generateSection(a: WorkbookAnswers, sectionId: string): ResultSectionDraft {
    const section = buildSections(a).find((s) => s.id === sectionId);
    if (!section) {
      throw new Error(`Unknown section id: ${sectionId}`);
    }
    return section;
  },
};
