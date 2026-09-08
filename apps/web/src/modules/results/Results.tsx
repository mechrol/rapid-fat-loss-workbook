import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { ProjectDto, ResultSectionDto, ResultWithSections } from '../../api/types';

function fullResultText(name: string, sections: ResultSectionDto[]): string {
  let out = `# ${name}\n\n`;
  for (const s of sections) {
    out += `## ${s.title}\n`;
    for (const b of s.bullets.filter((b) => b && b.trim())) out += `- ${b}\n`;
    out += '\n';
  }
  return out;
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [data, setData] = useState<ResultWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const pollRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  const load = async (polling: boolean) => {
    if (!id) return;
    try {
      const result = await api.getResult(id);
      setData(result);
      setLoading(false);
      if (pollRef.current) {
        window.clearTimeout(pollRef.current);
        pollRef.current = null;
      }
    } catch (e) {
      const err = e as { status?: number };
      if (err.status === 404 && polling) {
        pollRef.current = window.setTimeout(() => load(true), 1200);
      } else if (err.status === 404) {
        pollRef.current = window.setTimeout(() => load(true), 1200);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load result');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    api.getProject(id).then(setProject).catch(() => setProject(null));
    load(true);
    return () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Building your workbook…</div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Loading…</div>;

  const { result, sections } = data;
  const name = project?.name ?? 'Untitled workbook';

  const updateBullet = (secIdx: number, bulletIdx: number, text: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.sections[secIdx].bullets[bulletIdx] = text;
      return next;
    });
  };

  const addBullet = (secIdx: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.sections[secIdx].bullets.push('');
      return next;
    });
  };

  const deleteBullet = (secIdx: number, bulletIdx: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.sections[secIdx].bullets.splice(bulletIdx, 1);
      return next;
    });
  };

  const saveSection = async (secIdx: number) => {
    const sec = sections[secIdx];
    await api.patchSection(id!, sec.id, sec.bullets);
    showToast('Section saved');
  };

  const regenerate = async (secIdx: number) => {
    const sec = sections[secIdx];
    const fresh = await api.regenerateSection(id!, sec.id);
    setData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.sections[secIdx] = fresh;
      return next;
    });
    showToast('Section regenerated');
  };

  const approve = async () => {
    await api.approve(id!);
    setData((prev) => (prev ? { ...prev, result: { ...prev.result, status: 'approved' } } : prev));
    showToast('Result approved');
  };

  const unapprove = async () => {
    await api.unapprove(id!);
    setData((prev) => (prev ? { ...prev, result: { ...prev.result, status: 'draft' } } : prev));
    showToast('Moved back to draft');
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(fullResultText(name, sections));
    showToast('Copied complete result');
  };

  const download = () => {
    window.location.href = api.exportUrl(id!);
  };

  return (
    <>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">STAGE 4–5 OF 6 · EDIT &amp; APPROVE</div>
          <h2 style={{ margin: '0 0 6px' }}>{name}</h2>
        </div>
        <span className={`badge ${result.status === 'approved' ? 'badge-approved' : 'badge-draft'}`}>
          {result.status === 'approved' ? 'APPROVED' : 'DRAFT'}
        </span>
      </div>

      <div style={{ marginTop: 20 }}>
        {sections.map((sec, si) => (
          <div className="section-block" key={sec.id}>
            <div className="row between">
              <h3>{sec.title}</h3>
              <button className="icon-btn" title="Regenerate this section only" onClick={() => regenerate(si)}>⟳</button>
            </div>
            {sec.bullets.map((b, bi) => (
              <div className="bullet-row" key={bi}>
                <div className="bullet-dot" />
                <textarea className="bullet-text" rows={2} style={{ background: 'transparent', border: 'none', width: '100%', padding: 0, fontFamily: 'inherit', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-dim)' }} value={b} onChange={(e) => updateBullet(si, bi, e.target.value)} />
                <button className="icon-btn" title="Remove line" onClick={() => deleteBullet(si, bi)}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ padding: '6px 0', fontSize: 12 }} onClick={() => addBullet(si)}>+ Add line</button>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => saveSection(si)}>Save section</button>
            </div>
          </div>
        ))}
      </div>

      <div className="row between" style={{ marginTop: 24, flexWrap: 'wrap', gap: 14 }}>
        <div className="row">
          <button className="btn" onClick={copyAll}>Copy Complete Result</button>
          <button className="btn" onClick={download}>Download Export</button>
        </div>
        <div className="row">
          {result.status !== 'approved' ? (
            <button className="btn btn-coral" onClick={approve}>Approve Result</button>
          ) : (
            <button className="btn btn-ghost" onClick={unapprove}>Move back to Draft</button>
          )}
        </div>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/workbook')}>Start Another →</button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Return to Beginning</button>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}
