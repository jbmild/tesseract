import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { clientsApi, Client } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await clientsApi.getAll();
      setClients(res.data.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the clients list. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setClientToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      const client = clients.find(c => c.id === clientToDelete);
      await clientsApi.delete(clientToDelete);
      toast.success(`Great! The client "${client?.name || 'Client'}" has been removed.`);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete client:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error(`Sorry, you don't have permission to delete clients. Please contact your administrator.`);
      } else {
        toast.error(`We couldn't delete this client. ${errorMessage === 'something went wrong' ? 'They might have users assigned. Please check and try again.' : errorMessage}`);
      }
    } finally {
      setShowConfirmDialog(false);
      setClientToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id, formData);
      } else {
        await clientsApi.create(formData);
      }
      setShowModal(false);
      if (editingClient) {
        toast.success(`Perfect! The client "${formData.name}" has been updated.`);
      } else {
        toast.success(`Awesome! New client "${formData.name}" has been added successfully.`);
      }
      await loadData();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      const action = editingClient ? 'update' : 'create';
      
      // Provide more helpful error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        userFriendlyMessage = `The client name "${formData.name}" already exists. Please choose a different name.`;
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        userFriendlyMessage = 'Please make sure the client name is filled in correctly.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'You don\'t have permission to do this. Please contact your administrator if you need access.';
      } else if (errorMessage === 'something went wrong') {
        userFriendlyMessage = 'We couldn\'t save the client. Please check your connection and try again.';
      }
      
      toast.error(`Sorry, we couldn't ${action} the client. ${userFriendlyMessage}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <h2>Clients Management</h2>
        <button onClick={handleCreate} className="btn-primary">+ Add Client</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Users</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">No clients found</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.users?.length || 0} user(s)</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(client)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteClick(client.id)} className="btn-delete">Delete</button>
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
            <h3>{editingClient ? 'Edit Client' : 'Create Client'}</h3>
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
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setClientToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
