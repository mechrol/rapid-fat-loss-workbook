import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { WorkbookAnswers } from '../../api/types';
import { BLANK_ANSWERS } from '../../api/types';
import { ACTIVITY_LABELS, HABIT_LABELS, INPUT_STEPS, OBSTACLE_LABELS, STYLE_LABELS } from './questions';

const STEP_LABELS = ['Answer', 'Review', 'Process', 'Edit', 'Approve', 'Save / Export'];

function chipLabel(field: string | undefined, o: string): string {
  if (field === 'obstacles') return OBSTACLE_LABELS[o] ?? o;
  if (field === 'style') return STYLE_LABELS[o] ?? o;
  return o;
}

export default function InputWorkflow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<WorkbookAnswers>({ ...BLANK_ANSWERS });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const projectId = useRef<string | null>(id ?? null);

  useEffect(() => {
    if (!id) return;
    api
      .listInput(id)
      .then((records) => {
        const next: WorkbookAnswers = { ...BLANK_ANSWERS, motivation: [], habits: [], obstacles: [] };
        for (const r of records) {
          const value = (r.payload as { value?: unknown })?.value;
          if (value !== undefined) {
            (next as unknown as Record<string, unknown>)[r.stepKey] = value;
          }
        }
        setAnswers(next);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (projectId.current) return;
    api
      .createProject()
      .then((p) => {
        projectId.current = p.id;
        navigate(`/workbook/${p.id}`, { replace: true });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to create project'));
  }, [navigate]);

  if (loading) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Loading…</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!projectId.current) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Preparing…</div>;

  const s = INPUT_STEPS[step];
  const a = answers;

  const persistField = (field: keyof WorkbookAnswers, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    if (projectId.current) {
      api.saveInput(projectId.current, field, value).catch(() => undefined);
    }
  };

  const toggleChip = (field: 'motivation' | 'habits' | 'obstacles', value: string) => {
    const arr = answers[field] as string[];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    persistField(field, next);
  };

  const setSingle = (field: 'activity' | 'style', value: string) => {
    persistField(field, answers[field] === value ? '' : value);
  };

  const startOver = () => {
    const blank: WorkbookAnswers = { ...BLANK_ANSWERS, motivation: [], habits: [], obstacles: [] };
    setAnswers(blank);
    (Object.keys(blank) as (keyof WorkbookAnswers)[]).forEach((field) => {
      if (projectId.current) {
        api.saveInput(projectId.current, field, blank[field]).catch(() => undefined);
      }
    });
  };

  const pct = Math.round(((step + 1) / INPUT_STEPS.length) * 100);

  const next = () => {
    if (step < INPUT_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      navigate(`/review/${projectId.current}`);
    }
  };

  return (
    <div className="stepper-wrap">
      <div className="rail">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`rail-item ${i < 1 ? 'done' : ''} ${i === 0 ? 'current' : ''}`}>
            <div className="rail-num">{i + 1}</div>
            <div className="rail-lbl">{label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="eyebrow">
          QUESTION {step + 1} OF {INPUT_STEPS.length}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: 22 }}>{s.q}</h2>
          <p className="hint" style={{ marginBottom: 22 }}>{s.hint}</p>

          {s.type === 'chips-multi' && (
            <>
              <div className="row" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
                {s.options!.map((o) => (
                  <button key={o} type="button" className={`chip ${(a[s.field as keyof WorkbookAnswers] as string[]).includes(o) ? 'on' : ''}`} onClick={() => toggleChip(s.field as 'motivation' | 'habits' | 'obstacles', o)}>
                    {chipLabel(s.field, o)}
                  </button>
                ))}
              </div>
              <label className="field-label">{s.otherLabel}</label>
              <textarea rows={2} value={(a[s.otherField as keyof WorkbookAnswers] as string) || ''} onChange={(e) => persistField(s.otherField as keyof WorkbookAnswers, e.target.value)} />
            </>
          )}

          {s.type === 'chips-single' && (
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {s.options!.map((o) => (
                <button key={o} type="button" className={`chip ${a[s.field as keyof WorkbookAnswers] === o ? 'on' : ''}`} onClick={() => setSingle(s.field as 'activity' | 'style', o)}>
                  {chipLabel(s.field, o)}
                </button>
              ))}
            </div>
          )}

          {s.type === 'textarea' && (
            <textarea rows={4} placeholder="Type your answer…" value={(a[s.field as keyof WorkbookAnswers] as string) || ''} onChange={(e) => persistField(s.field as keyof WorkbookAnswers, e.target.value)} />
          )}

          {s.type === 'mixed-start' && (
            <>
              <label className="field-label">Current activity level</label>
              <div className="row" style={{ flexWrap: 'wrap', marginBottom: 22 }}>
                {['Sedentary', 'Occasional', 'Regular'].map((o) => (
                  <button key={o} type="button" className={`chip ${a.activity === o ? 'on' : ''}`} onClick={() => setSingle('activity', o)}>
                    {ACTIVITY_LABELS[o]}
                  </button>
                ))}
              </div>
              <label className="field-label">Current eating pattern (pick what fits)</label>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {['Skip meals often', 'Eat late at night', 'Stress eat', 'Structured meals', 'Not sure'].map((o) => (
                  <button key={o} type="button" className={`chip ${a.habits.includes(o) ? 'on' : ''}`} onClick={() => toggleChip('habits', o)}>
                    {HABIT_LABELS[o]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="row between" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            ← Back
          </button>
          <div className="row">
            <button className="btn btn-ghost" onClick={startOver}>
              Start Over
            </button>
            <button className="btn btn-primary" onClick={next}>
              {step === INPUT_STEPS.length - 1 ? 'Review answers →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
