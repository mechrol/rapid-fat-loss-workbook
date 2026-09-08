import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { WorkbookAnswers } from '../../api/types';
import { BLANK_ANSWERS } from '../../api/types';
import { ACTIVITY_LABELS, HABIT_LABELS, OBSTACLE_LABELS, STYLE_LABELS } from '../input/questions';

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<WorkbookAnswers | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .listInput(id)
      .then((records) => {
        const next: WorkbookAnswers = { ...BLANK_ANSWERS, motivation: [], habits: [], obstacles: [] };
        for (const r of records) {
          const value = (r.payload as { value?: unknown })?.value;
          if (value !== undefined) (next as unknown as Record<string, unknown>)[r.stepKey] = value;
        }
        setAnswers(next);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [id]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!answers) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Loading…</div>;

  const a = answers;
  const rows: [string, string, number][] = [
    ["What's driving this", (a.motivation.join(', ') || '—') + (a.motivationOther ? ` — ${a.motivationOther}` : ''), 0],
    ['Starting point', (a.activity ? ACTIVITY_LABELS[a.activity] : '—') + ' · ' + (a.habits.map((h) => HABIT_LABELS[h]).join(', ') || 'no habits noted'), 1],
    ['Past obstacles', (a.obstacles.map((o) => OBSTACLE_LABELS[o]).join(', ') || '—') + (a.obstaclesOther ? ` — ${a.obstaclesOther}` : ''), 2],
    ['Working style', a.style ? STYLE_LABELS[a.style] : '—', 3],
    ['90-day vision', a.vision || '—', 4],
    ['Anything else', a.extra || '—', 5],
  ];

  const process = async () => {
    if (!id) return;
    setProcessing(true);
    setError('');
    try {
      const key = crypto.randomUUID();
      await api.process(id, key);
      navigate(`/results/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="eyebrow">STAGE 2 OF 6 · REVIEW</div>
      <h2 style={{ marginTop: 0 }}>Check your answers before we build your workbook</h2>
      <p className="hint" style={{ marginBottom: 24 }}>Nothing is processed yet. Edit anything below, then continue.</p>
      {error && <div className="error-banner">{error}</div>}
      <div className="card" style={{ padding: 8 }}>
        {rows.map(([label, val]) => (
          <div key={label} className="row between" style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '70%' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14 }}>{val}</div>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate(`/workbook/${id}`)}>Edit</button>
          </div>
        ))}
      </div>
      <div className="row between" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/workbook/${id}`)}>← Back to answers</button>
        <button className="btn btn-primary" onClick={process} disabled={processing}>
          {processing ? 'Processing…' : 'Process my workbook →'}
        </button>
      </div>
    </>
  );
}
