import { useAuth } from '../../auth/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <>
      <div className="eyebrow">SETTINGS / ACCOUNT</div>
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div className="card" style={{ maxWidth: 520 }}>
        <label className="field-label">Account</label>
        <div style={{ fontSize: 14 }}>{user?.email}</div>
        <p className="hint" style={{ marginBottom: 8 }}>Role: {user?.role ?? 'user'}</p>
        <label className="field-label" style={{ marginTop: 16 }}>Display name</label>
        <div style={{ fontSize: 14 }}>{user?.displayName || '—'}</div>
        <p className="hint">Your workbooks are stored securely on the server and isolated to your account.</p>
      </div>
      <div className="footer-note">
        Your data is protected by per-account ownership. Deleting an account is an admin action;
        reach out to an administrator if you need it removed.
      </div>
    </>
  );
}
