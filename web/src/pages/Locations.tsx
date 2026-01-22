import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { locationsApi, Location } from '../services/api';
import { useClient } from '../contexts/ClientContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Locations() {
  const { clientChangeKey, selectedClient } = useClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, [clientChangeKey]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await locationsApi.getAll();
      setLocations(res.data.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the locations list. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedClient) {
      toast.error('Please select a client first to create a location.');
      return;
    }
    setEditingLocation(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ name: location.name });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setLocationToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    try {
      const location = locations.find(l => l.id === locationToDelete);
      await locationsApi.delete(locationToDelete);
      toast.success(`Great! The location "${location?.name || 'Location'}" has been removed.`);
      await loadData();
    } catch (error: any) {
      console.error('Failed to delete location:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      toast.error(`We couldn't delete this location. ${errorMessage === 'something went wrong' ? 'Please check and try again.' : errorMessage}`);
    } finally {
      setShowConfirmDialog(false);
      setLocationToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error('Please select a client first.');
      return;
    }
    try {
      if (editingLocation) {
        await locationsApi.update(editingLocation.id, formData);
        toast.success(`Perfect! The location "${formData.name}" has been updated.`);
      } else {
        await locationsApi.create(formData);
        toast.success(`Awesome! New location "${formData.name}" has been added successfully.`);
      }
      setShowModal(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to save location:', error);
      const errorMessage = error.response?.data?.error || error.message || 'something went wrong';
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error(`Sorry, you don't have permission to ${editingLocation ? 'update' : 'create'} locations. Please contact your administrator.`);
      } else {
        toast.error(`We couldn't save this location. ${errorMessage === 'something went wrong' ? 'Please check your input and try again.' : errorMessage}`);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <h2>Locations Management</h2>
        <button onClick={handleCreate} className="btn-primary" disabled={!selectedClient}>
          + Add Location
        </button>
      </div>

      {!selectedClient && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          color: '#856404'
        }}>
          ⚠️ Please select a client to view and manage locations.
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Client</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!selectedClient || locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  {!selectedClient 
                    ? 'Please select a client to view locations' 
                    : `No locations found for ${selectedClient.name}`}
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.name}</td>
                  <td>{location.client?.name || 'N/A'}</td>
                  <td>{new Date(location.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(location)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteClick(location.id)} className="btn-delete">Delete</button>
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
            <h3>{editingLocation ? 'Edit Location' : 'Create Location'}</h3>
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
              {selectedClient && (
                <div className="form-group">
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    color: '#1976d2',
                    fontSize: '0.9rem'
                  }}>
                    ℹ️ This location will be associated with <strong>{selectedClient.name}</strong>
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setLocationToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
