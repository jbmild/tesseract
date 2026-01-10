import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedClient, availableClients, setSelectedClient } = useClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = parseInt(e.target.value);
    const client = availableClients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Login Section */}
        <div className="sidebar-section login-section">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username || 'Guest'}</div>
              {user?.role && (
                <div className="user-role-badge">{user.role.name}</div>
              )}
            </div>
          </div>

          {availableClients.length > 0 && (
            <div className="client-selector-wrapper">
              <label className="client-label">Client:</label>
              <select
                className="client-selector-sidebar"
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
            </div>
          )}

          <button onClick={handleLogout} className="btn-logout-sidebar">
            <span>🚪</span> Logout
          </button>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-section navigation-section">
          <h3 className="section-title">Navigation</h3>
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </Link>
            <Link
              to="/users"
              className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Users</span>
            </Link>
            <Link
              to="/clients"
              className={`nav-item ${location.pathname === '/clients' ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">🏢</span>
              <span className="nav-text">Clients</span>
            </Link>
            <Link
              to="/roles"
              className={`nav-item ${location.pathname === '/roles' ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">🔐</span>
              <span className="nav-text">Roles</span>
            </Link>
            <Link
              to="/permissions"
              className={`nav-item ${location.pathname === '/permissions' ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">🔑</span>
              <span className="nav-text">Permissions</span>
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}
