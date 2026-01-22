import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { rolesApi, permissionsApi, Role, Permission, CreateRoleDto, UpdateRoleDto } from '../services/api';
import { useClient } from '../contexts/ClientContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

// Component for resource group in permissions tree
interface ResourceGroupProps {
  resource: string;
  permissions: Permission[];
  isExpanded: boolean;
  selectedPermissions: number[];
  onToggleResource: () => void;
  onToggleAllInResource: () => void;
  onTogglePermission: (permissionId: number, checked: boolean) => void;
}

function ResourceGroup({
  resource,
  permissions,
  isExpanded,
  selectedPermissions,
  onToggleResource,
  onToggleAllInResource,
  onTogglePermission,
}: ResourceGroupProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const isFullySelected = permissions.every(p => selectedPermissions.includes(p.id));
  const isPartiallySelected = permissions.some(p => selectedPermissions.includes(p.id)) && !isFullySelected;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected, selectedPermissions]);

  return (
    <div className="permission-resource-group">
      <div className="resource-header">
        <button
          type="button"
          className="resource-toggle"
          onClick={onToggleResource}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <label className="resource-checkbox-label">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={isFullySelected}
            onChange={onToggleAllInResource}
          />
          <strong style={{ marginLeft: '8px', fontSize: '16px' }}>{resource}</strong>
          <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
            ({permissions.length} permission{permissions.length !== 1 ? 's' : ''})
          </span>
        </label>
      </div>
      {isExpanded && (
        <div className="permission-methods">
          {permissions
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((permission) => (
              <label key={permission.id} className="permission-item">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => onTogglePermission(permission.id, e.target.checked)}
                />
                <span style={{ fontWeight: '500' }}>{permission.name}</span>
                {permission.description && (
                  <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>
                    - {permission.description}
                  </span>
                )}
              </label>
            ))}
        </div>
      )}
    </div>
  );
}

export default function Roles() {
  const { clientChangeKey, selectedClient, availableClients } = useClient();
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
    clientId: null,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [clientChangeKey]); // Reload when client changes

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPermissionsModal) {
          setShowPermissionsModal(false);
        } else if (showModal) {
          setShowModal(false);
        }
      }
    };

    if (showModal || showPermissionsModal) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal, showPermissionsModal]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        rolesApi.getAll(),
        permissionsApi.getAll(),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(permissionsRes.data.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the roles and permissions. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    // If a client is selected, use it; otherwise allow selection (null for global)
    setFormData({ 
      name: '', 
      description: '',
      clientId: selectedClient ? selectedClient.id : null,
    });
    setShowModal(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      clientId: role.clientId ?? null,
    });
    setShowModal(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    // Expand all resources by default
    const allResources = new Set(permissions.map(p => p.resource));
    setExpandedResources(allResources);
    setShowPermissionsModal(true);
  };

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const toggleResource = (resource: string) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resource)) {
        newSet.delete(resource);
      } else {
        newSet.add(resource);
      }
      return newSet;
    });
  };

  const toggleAllInResource = (resource: string) => {
    const resourcePermissions = permissionsByResource[resource] || [];
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all in this resource
      setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
    } else {
      // Select all in this resource
      setSelectedPermissions(prev => {
        const newSet = new Set(prev);
        resourcePermissionIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setRoleToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      const role = roles.find(r => r.id === roleToDelete);
      await rolesApi.delete(roleToDelete);
      toast.success(`Great! The role "${role?.name || 'Role'}" has been removed.`);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error(`Sorry, you don't have permission to delete roles. Please contact your administrator.`);
      } else {
        toast.error(`We couldn't delete this role. ${errorMessage === 'something went wrong' ? 'It might be assigned to users. Please check and try again.' : errorMessage}`);
      }
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
      if (editingRole) {
        toast.success(`Perfect! The role "${formData.name}" has been updated.`);
      } else {
        toast.success(`Awesome! New role "${formData.name}" has been created successfully.`);
      }
      await loadData();
    } catch (error: any) {
      console.error('Failed to save role:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      const action = editingRole ? 'update' : 'create';
      
      // Provide more helpful error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        userFriendlyMessage = `The role name "${formData.name}" already exists. Please choose a different name.`;
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        userFriendlyMessage = 'Please make sure the role name is filled in correctly.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'You don\'t have permission to do this. Please contact your administrator if you need access.';
      } else if (errorMessage === 'something went wrong') {
        userFriendlyMessage = 'We couldn\'t save the role. Please check your connection and try again.';
      }
      
      toast.error(`Sorry, we couldn't ${action} the role. ${userFriendlyMessage}`);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await rolesApi.assignPermissions(selectedRole.id, selectedPermissions);
      setShowPermissionsModal(false);
      const permissionCount = selectedPermissions.length;
      if (permissionCount === 0) {
        toast.success(`All permissions have been removed from the role "${selectedRole.name}".`);
      } else {
        toast.success(`Perfect! ${permissionCount} permission${permissionCount !== 1 ? 's have' : ' has'} been assigned to "${selectedRole.name}".`);
      }
      await loadData();
    } catch (error: any) {
      console.error('Failed to save permissions:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error(`Sorry, you don't have permission to assign permissions. Please contact your administrator.`);
      } else {
        toast.error(`We couldn't save the permissions for "${selectedRole.name}". ${errorMessage === 'something went wrong' ? 'Please try again in a moment.' : errorMessage}`);
      }
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
              <th style={{ textAlign: 'right' }}></th>
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
                  <td style={{ textAlign: 'right' }}>
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
              {/* Show client selector when "All" is selected (no client selected) */}
              {!selectedClient && (
                <div className="form-group">
                  <label>Client (optional - leave empty for global role)</label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value ? parseInt(e.target.value) : null })}
                  >
                    <option value="">Global Role (All Clients)</option>
                    {availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    Select a client to make this role client-specific, or leave empty for a global role
                  </small>
                </div>
              )}
              {/* Show info when a client is selected */}
              {selectedClient && (
                <div className="form-group">
                  <div style={{ 
                    padding: '10px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '4px', 
                    color: '#1976d2',
                    fontSize: '0.9rem'
                  }}>
                    ℹ️ This role will be created for <strong>{selectedClient.name}</strong>
                  </div>
                </div>
              )}
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
            <div className="permissions-tree">
              {Object.keys(permissionsByResource).sort().map((resource) => (
                <ResourceGroup
                  key={resource}
                  resource={resource}
                  permissions={permissionsByResource[resource]}
                  isExpanded={expandedResources.has(resource)}
                  selectedPermissions={selectedPermissions}
                  onToggleResource={() => toggleResource(resource)}
                  onToggleAllInResource={() => toggleAllInResource(resource)}
                  onTogglePermission={(permissionId, checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, permissionId]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
                    }
                  }}
                />
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: '20px' }}>
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
