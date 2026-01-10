import { Link, Outlet, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="layout-header">
        <h1>🧊 Tesseract</h1>
        <p className="subtitle">The cosmic cube that controls your warehouse Space</p>
      </header>

      <nav className="layout-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>
          👥 Users
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
