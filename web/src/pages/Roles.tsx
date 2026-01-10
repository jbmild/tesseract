import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { rolesApi, permissionsApi, Role, Permission, CreateRoleDto, UpdateRoleDto } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesApi.getAll(),
        permissionsApi.getAll(),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(permissionsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
    });
    setShowModal(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setShowPermissionsModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setRoleToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await rolesApi.delete(roleToDelete);
      toast.success('Role deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    } finally {
      setShowConfirmDialog(false);
      setRoleToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await rolesApi.update(editingRole.id, formData);
      } else {
        await rolesApi.create(formData);
      }
      setShowModal(false);
      toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
      await loadData();
    } catch (error: any) {
      console.error('Failed to save role:', error);
      toast.error(error.response?.data?.error || 'Failed to save role');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await rolesApi.assignPermissions(selectedRole.id, selectedPermissions);
      setShowPermissionsModal(false);
      toast.success('Permissions assigned successfully');
      await loadData();
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      toast.error(error.response?.data?.error || 'Failed to save permissions');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <h2>Roles Management</h2>
        <button onClick={handleCreate} className="btn-primary">+ Add Role</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">No roles found</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>{role.description || '-'}</td>
                  <td>{role.permissions?.length || 0} permission(s)</td>
                  <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(role)} className="btn-edit">Edit</button>
                    <button onClick={() => handleManagePermissions(role)} className="btn-permissions">Permissions</button>
                    <button onClick={() => handleDeleteClick(role.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingRole ? 'Edit Role' : 'Create Role'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPermissionsModal && selectedRole && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Permissions for {selectedRole.name}</h3>
            <div className="permissions-list">
              {permissions.map((permission) => (
                <label key={permission.id} className="permission-item">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, permission.id]);
                      } else {
                        setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                      }
                    }}
                  />
                  <div>
                    <strong>{permission.name}</strong>
                    <span className="permission-resource">({permission.resource})</span>
                    {permission.description && <p>{permission.description}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button onClick={handleSavePermissions} className="btn-primary">Save Permissions</button>
              <button onClick={() => setShowPermissionsModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setRoleToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
