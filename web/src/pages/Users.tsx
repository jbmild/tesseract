import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usersApi, rolesApi, clientsApi, User, CreateUserDto, UpdateUserDto, Client } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    password: '',
    clientIds: [],
    roleId: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, clientsRes] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        clientsApi.getAll(),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
      setClients(clientsRes.data.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the users list. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', clientIds: [], roleId: null });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      clientIds: user.clients?.map(c => c.id) || [],
      roleId: user.roleId,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      const user = users.find(u => u.id === userToDelete);
      await usersApi.delete(userToDelete);
      toast.success(`Great! The user "${user?.username || 'User'}" has been removed.`);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error(`Sorry, you don't have permission to delete users. Please contact your administrator.`);
      } else {
        toast.error(`We couldn't delete this user. ${errorMessage === 'something went wrong' ? 'They might be assigned to important records. Please check and try again.' : errorMessage}`);
      }
    } finally {
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          username: formData.username,
          clientIds: formData.clientIds,
          roleId: formData.roleId,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await usersApi.update(editingUser.id, updateData);
      } else {
        await usersApi.create(formData);
      }
      setShowModal(false);
      if (editingUser) {
        toast.success(`Perfect! The user "${formData.username}" has been updated.`);
      } else {
        toast.success(`Awesome! New user "${formData.username}" has been added successfully.`);
      }
      await loadData();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      const action = editingUser ? 'update' : 'create';
      
      // Provide more helpful error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        userFriendlyMessage = `The username "${formData.username}" is already taken. Please choose a different one.`;
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        userFriendlyMessage = 'Please make sure all required fields are filled in correctly.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'You don\'t have permission to do this. Please contact your administrator if you need access.';
      } else if (errorMessage === 'something went wrong') {
        userFriendlyMessage = 'We couldn\'t save the user. Please check your connection and try again.';
      }
      
      toast.error(`Sorry, we couldn't ${action} the user. ${userFriendlyMessage}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <h2>Users Management</h2>
        <button onClick={handleCreate} className="btn-primary">+ Add User</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Clients</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.clients && user.clients.length > 0 ? user.clients.map(c => c.name).join(', ') : '-'}</td>
                  <td>{user.role?.name || '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteClick(user.id)} className="btn-delete">Delete</button>
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
            <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser ? '(leave empty to keep current)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Clients</label>
                <select
                  multiple
                  size={5}
                  value={formData.clientIds?.map(id => id.toString()) || []}
                  onChange={(e) => {
                    const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setFormData({ ...formData, clientIds: selectedIds });
                  }}
                  style={{ minHeight: '100px' }}
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Hold Ctrl (or Cmd on Mac) to select multiple clients
                </small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.roleId || ''}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">No Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setUserToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
