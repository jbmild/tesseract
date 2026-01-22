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
    const value = e.target.value;
    if (!value || value === '') {
      setSelectedClient(null);
    } else {
      const clientId = parseInt(value);
      const client = availableClients.find(c => c.id === clientId);
      setSelectedClient(client || null);
    }
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
                {user?.role?.name?.toLowerCase() === 'systemadmin' && (
                  <option value="">All</option>
                )}
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
          {/* General Section */}
          <div className="nav-group">
            <h3 className="nav-group-title">General</h3>
            <nav className="sidebar-nav">
              <Link
                to="/"
                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
              </Link>
            </nav>
          </div>

          {/* User Management Section */}
          <div className="nav-group">
            <h3 className="nav-group-title">User Management</h3>
            <nav className="sidebar-nav">
              <Link
                to="/users"
                className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Users</span>
              </Link>
              <Link
                to="/roles"
                className={`nav-item ${location.pathname === '/roles' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">🔐</span>
                <span className="nav-text">Roles</span>
              </Link>
              {user?.role?.name?.toLowerCase() === 'systemadmin' && (
                <Link
                  to="/permissions"
                  className={`nav-item ${location.pathname === '/permissions' ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">🔑</span>
                  <span className="nav-text">Permissions</span>
                </Link>
              )}
            </nav>
          </div>

          {/* System Administration Section (SystemAdmin only) */}
          {user?.role?.name?.toLowerCase() === 'systemadmin' && (
            <div className="nav-group">
              <h3 className="nav-group-title">System Administration</h3>
              <nav className="sidebar-nav">
                <Link
                  to="/clients"
                  className={`nav-item ${location.pathname === '/clients' ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="nav-icon">🏢</span>
                  <span className="nav-text">Clients</span>
                </Link>
              </nav>
            </div>
          )}

          {/* Locations Section */}
          <div className="nav-group">
            <h3 className="nav-group-title">Locations</h3>
            <nav className="sidebar-nav">
              <Link
                to="/locations"
                className={`nav-item ${location.pathname === '/locations' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">📍</span>
                <span className="nav-text">Locations</span>
              </Link>
              <Link
                to="/warehouses"
                className={`nav-item ${location.pathname === '/warehouses' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">🏭</span>
                <span className="nav-text">Warehouses</span>
              </Link>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
