import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import type { AdminMetrics } from '../../api/types';

export default function Admin() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminMetrics().then(setMetrics).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load metrics'));
  }, []);

  if (user?.role !== 'admin') {
    return (
      <>
        <div className="eyebrow">ADMIN WORKSPACE</div>
        <div className="empty">
          <h3 style={{ color: 'var(--ink)' }}>Admin access required</h3>
          <p>This area is restricted to administrators.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="eyebrow">ADMIN WORKSPACE</div>
      <h2 style={{ marginTop: 0 }}>Admin overview</h2>
      <p className="hint" style={{ marginBottom: 20, maxWidth: 560 }}>Aggregated, anonymized metrics. Individual answers are never shown here (PRD 8.7).</p>
      {error && <div className="error-banner">{error}</div>}
      {metrics && (
        <div className="grid2">
          <div className="card">
            <div className="eyebrow">PLATFORM</div>
            <div style={{ fontSize: 32, fontFamily: "'Space Grotesk'" }}>{metrics.totalUsers}</div>
            <div className="hint">Total users</div>
          </div>
          <div className="card">
            <div className="eyebrow">PLATFORM</div>
            <div style={{ fontSize: 32, fontFamily: "'Space Grotesk'" }}>{metrics.totalProjects}</div>
            <div className="hint">Total workbooks</div>
          </div>
          <div className="card">
            <div className="eyebrow">PLATFORM</div>
            <div style={{ fontSize: 32, fontFamily: "'Space Grotesk'" }}>{metrics.approvedProjects}</div>
            <div className="hint">Approved workbooks</div>
          </div>
          <div className="card">
            <div className="eyebrow">LAST 7 DAYS</div>
            <div style={{ fontSize: 32, fontFamily: "'Space Grotesk'" }}>{metrics.projectsLast7d}</div>
            <div className="hint">New workbooks</div>
          </div>
        </div>
      )}
    </>
  );
}
