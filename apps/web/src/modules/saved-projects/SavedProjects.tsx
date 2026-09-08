import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import type { ProjectDto } from '../../api/types';

export default function SavedProjects() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProjectDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listProjects(page, pageSize);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const newProject = async () => {
    const p = await api.createProject();
    navigate(`/workbook/${p.id}`);
  };

  const open = (p: ProjectDto) => {
    api.getResult(p.id).then(() => navigate(`/results/${p.id}`)).catch(() => navigate(`/workbook/${p.id}`));
  };

  const del = async (p: ProjectDto) => {
    if (!window.confirm('Delete this workbook? This cannot be undone.')) return;
    await api.deleteProject(p.id);
    load();
  };

  if (loading) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Loading…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <>
      <div className="row between">
        <div className="eyebrow">SAVED PROJECTS · {total} TOTAL</div>
        <button className="btn btn-primary" onClick={newProject}>+ New workbook</button>
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <h3 style={{ color: 'var(--ink)' }}>Nothing saved yet</h3>
          <p>Finish a workbook's review step to save your first project here.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={newProject}>Start a workbook →</button>
        </div>
      ) : (
        items.map((p) => (
          <div className="proj-row" key={p.id}>
            <div>
              <div className="proj-name">{p.name}</div>
              <div className="proj-meta">{new Date(p.createdAt).toLocaleDateString()} · {p.status.toUpperCase()}</div>
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => open(p)}>Open</button>
              <button className="btn btn-danger" onClick={() => del(p)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {total > pageSize && (
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button>
          <span className="hint" style={{ margin: 0 }}>Page {page} of {Math.ceil(total / pageSize)}</span>
          <button className="btn btn-ghost" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
