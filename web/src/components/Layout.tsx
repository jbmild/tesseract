import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div>
          <h1>🧊 Tesseract</h1>
          <p className="subtitle">The cosmic cube that controls your warehouse Space</p>
        </div>
        <div className="user-info">
          <span className="username">{user?.username}</span>
          {user?.role && <span className="user-role">{user.role.name}</span>}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <nav className="layout-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
          👥 Users
        </Link>
        <Link to="/clients" className={location.pathname === '/clients' ? 'active' : ''}>
          🏢 Clients
        </Link>
        <Link to="/roles" className={location.pathname === '/roles' ? 'active' : ''}>
          🔐 Roles
        </Link>
        <Link to="/permissions" className={location.pathname === '/permissions' ? 'active' : ''}>
          🔑 Permissions
        </Link>
      </nav>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
