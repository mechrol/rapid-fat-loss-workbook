import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '60px auto 0' }}>
      <div className="eyebrow">SIGN IN · REQUIRED</div>
      <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <p className="hint" style={{ marginBottom: 24 }}>Sign in to save your workbooks and keep them isolated to your account.</p>
      {error && <div className="error-banner">{error}</div>}
      <div className="card" style={{ padding: 24 }}>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label className="field-label">Display name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ marginBottom: 16 }} />
            </>
          )}
          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ marginBottom: 16 }} />
          <label className="field-label">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} required style={{ marginBottom: 20 }} />
          <div className="row between">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Need an account?' : 'Already have one?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
