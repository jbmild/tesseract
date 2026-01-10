import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedClient, availableClients, setSelectedClient } = useClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = parseInt(e.target.value);
    const client = availableClients.find(c => c.id === clientId);
    setSelectedClient(client || null);
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
          {availableClients.length > 0 && (
            <select
              className="client-selector"
              value={selectedClient?.id || ''}
              onChange={handleClientChange}
            >
              <option value="">Select Client</option>
              {availableClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
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
