import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links: [string, string][] = [
    ['/', 'Welcome'],
    ['/workbook', 'Workbook'],
    ['/projects', 'Saved Projects'],
    ['/settings', 'Settings'],
  ];
  if (user?.role === 'admin') links.push(['/admin', 'Admin']);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <button className="brand" onClick={() => navigate('/')} type="button">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">Rapid Fat Loss Framework</div>
          <div className="brand-sub">INTERACTIVE WORKBOOK</div>
        </div>
      </button>
      <div className="nav">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
            {label}
          </NavLink>
        ))}
        <button className="navlink" onClick={handleLogout} type="button" title={user?.email}>
          Sign out
        </button>
      </div>
    </div>
  );
}
