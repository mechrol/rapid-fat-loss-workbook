import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Login from './modules/onboarding/Login';
import Welcome from './modules/onboarding/Welcome';
import InputWorkflow from './modules/input/InputWorkflow';
import Review from './modules/review/Review';
import Results from './modules/results/Results';
import SavedProjects from './modules/saved-projects/SavedProjects';
import Settings from './modules/settings/Settings';
import Admin from './modules/admin/Admin';
import Topbar from './components/Topbar';

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="hint" style={{ padding: 80, textAlign: 'center' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div id="app">
      {user && <Topbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Welcome /></Protected>} />
        <Route path="/workbook" element={<Protected><InputWorkflow /></Protected>} />
        <Route path="/workbook/:id" element={<Protected><InputWorkflow /></Protected>} />
        <Route path="/review/:id" element={<Protected><Review /></Protected>} />
        <Route path="/results/:id" element={<Protected><Results /></Protected>} />
        <Route path="/projects" element={<Protected><SavedProjects /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
