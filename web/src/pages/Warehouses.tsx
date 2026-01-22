import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { warehousesApi, locationsApi, Warehouse, Location } from '../services/api';
import { useClient } from '../contexts/ClientContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Warehouses() {
  const { clientChangeKey, selectedClient } = useClient();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<number | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', locationId: '' });

  useEffect(() => {
    loadData();
  }, [clientChangeKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [warehousesRes, locationsRes] = await Promise.all([
        warehousesApi.getAll(),
        locationsApi.getAll(),
      ]);
      setWarehouses(warehousesRes.data.data);
      setLocations(locationsRes.data.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the warehouses list. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedClient) {
      toast.error('Please select a client first to create a warehouse.');
      return;
    }
    if (locations.length === 0) {
      toast.error('Please create at least one location for the selected client before creating a warehouse.');
      return;
    }
    setEditingWarehouse(null);
    setFormData({ name: '', locationId: '' });
    setShowModal(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({ 
      name: warehouse.name, 
      locationId: warehouse.locationId.toString() 
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setWarehouseToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (warehouseToDelete === null) return;

    try {
      await warehousesApi.delete(warehouseToDelete);
      toast.success('Warehouse deleted successfully!');
      setWarehouses(warehouses.filter((w) => w.id !== warehouseToDelete));
      setShowConfirmDialog(false);
      setWarehouseToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete warehouse:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Failed to delete warehouse. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a warehouse name.');
      return;
    }
    if (!formData.locationId) {
      toast.error('Please select a location.');
      return;
    }

    try {
      if (editingWarehouse) {
        const res = await warehousesApi.update(editingWarehouse.id, {
          name: formData.name,
          locationId: parseInt(formData.locationId, 10),
        });
        setWarehouses(warehouses.map((w) => (w.id === editingWarehouse.id ? res.data.data : w)));
        toast.success('Warehouse updated successfully!');
      } else {
        const res = await warehousesApi.create({
          name: formData.name,
          locationId: parseInt(formData.locationId, 10),
        });
        setWarehouses([...warehouses, res.data.data]);
        toast.success('Warehouse created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '', locationId: '' });
      setEditingWarehouse(null);
    } catch (error: any) {
      console.error('Failed to save warehouse:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to save warehouse. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Please check your input and try again. ${errorMessage}`}`);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management">
      <div className="management-header">
        <h2>Warehouses Management</h2>
        <button onClick={handleCreate} className="btn-primary" disabled={!selectedClient || locations.length === 0}>
          + Add Warehouse
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
          ⚠️ Please select a client to view and manage warehouses.
        </div>
      )}

      {selectedClient && locations.length === 0 && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          color: '#856404'
        }}>
          ⚠️ Please create at least one location for {selectedClient.name} before creating warehouses.
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Client</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!selectedClient || warehouses.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  {!selectedClient 
                    ? 'Please select a client to view warehouses' 
                    : `No warehouses found for ${selectedClient.name}`}
                </td>
              </tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td>{warehouse.id}</td>
                  <td>{warehouse.name}</td>
                  <td>{warehouse.location?.name || 'N/A'}</td>
                  <td>{warehouse.location?.client?.name || 'N/A'}</td>
                  <td>{new Date(warehouse.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(warehouse)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteClick(warehouse.id)} className="btn-delete">Delete</button>
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
            <div className="modal-header">
              <h3>{editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter warehouse name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="locationId">Location *</label>
                <select
                  id="locationId"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingWarehouse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onCancel={() => {
          setShowConfirmDialog(false);
          setWarehouseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Warehouse"
        message="Are you sure you want to delete this warehouse? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
