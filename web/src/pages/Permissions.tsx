import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { permissionsApi, Permission } from '../services/api';
import './Management.css';

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterResource, setFilterResource] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await permissionsApi.getAll();
      setPermissions(res.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await permissionsApi.sync();
      setPermissions(res.data.data);
      toast.success(res.data.message || `Synced ${res.data.data.length} permissions from routes`);
    } catch (error: any) {
      console.error('Failed to sync permissions:', error);
      toast.error(error.response?.data?.error || 'Failed to sync permissions');
    } finally {
      setSyncing(false);
    }
  };

  const uniqueResources = Array.from(new Set(permissions.map(p => p.resource)));

  const filteredPermissions = filterResource
    ? permissions.filter(p => p.resource === filterResource)
    : permissions;

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <div>
          <h2>Permissions Management</h2>
          <p style={{ color: 'white', marginTop: '0.5rem', opacity: 0.9 }}>
            Permissions are automatically generated from backend routes. Click "Sync Permissions" to update from current routes.
          </p>
        </div>
        <button onClick={handleSync} className="btn-primary" disabled={syncing}>
          {syncing ? 'Syncing...' : '🔄 Sync Permissions'}
        </button>
      </div>

      <div className="filter-section">
        <label>Filter by Resource:</label>
        <select
          value={filterResource}
          onChange={(e) => setFilterResource(e.target.value)}
        >
          <option value="">All Resources</option>
          {uniqueResources.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Resource</th>
              <th>Description</th>
              <th>Roles</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">No permissions found</td>
              </tr>
            ) : (
              filteredPermissions.map((permission) => (
                <tr key={permission.id}>
                  <td>{permission.id}</td>
                  <td>{permission.name}</td>
                  <td><span className="badge">{permission.resource}</span></td>
                  <td>{permission.description || '-'}</td>
                  <td>{permission.roles?.length || 0} role(s)</td>
                  <td>{new Date(permission.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Auto-generated</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
