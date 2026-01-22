import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { warehousesApi, locationsApi, Warehouse, Location, CreateWarehouseDto } from '../services/api';
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
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    name: '',
    locationId: 0,
    aisleType: null,
    aisleCount: null,
    bayType: null,
    bayCount: null,
    levelType: null,
    levelCount: null,
    binType: null,
    binCount: null,
  });

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
    setFormData({
      name: '',
      locationId: 0,
      aisleType: null,
      aisleCount: null,
      bayType: null,
      bayCount: null,
      levelType: null,
      levelCount: null,
      binType: null,
      binCount: null,
    });
    setShowModal(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({ 
      name: warehouse.name, 
      locationId: warehouse.locationId,
      aisleType: warehouse.aisleType || null,
      aisleCount: warehouse.aisleCount || null,
      bayType: warehouse.bayType || null,
      bayCount: warehouse.bayCount || null,
      levelType: warehouse.levelType || null,
      levelCount: warehouse.levelCount || null,
      binType: warehouse.binType || null,
      binCount: warehouse.binCount || null,
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
      const warehouseData: CreateWarehouseDto = {
        name: formData.name,
        locationId: typeof formData.locationId === 'string' ? parseInt(formData.locationId, 10) : formData.locationId,
        aisleType: formData.aisleType || null,
        aisleCount: formData.aisleCount ? parseInt(formData.aisleCount.toString(), 10) : null,
        bayType: formData.bayType || null,
        bayCount: formData.bayCount ? parseInt(formData.bayCount.toString(), 10) : null,
        levelType: formData.levelType || null,
        levelCount: formData.levelCount ? parseInt(formData.levelCount.toString(), 10) : null,
        binType: formData.binType || null,
        binCount: formData.binCount ? parseInt(formData.binCount.toString(), 10) : null,
      };

      if (editingWarehouse) {
        const res = await warehousesApi.update(editingWarehouse.id, warehouseData);
        setWarehouses(warehouses.map((w) => (w.id === editingWarehouse.id ? res.data.data : w)));
        toast.success('Warehouse updated successfully!');
      } else {
        const res = await warehousesApi.create(warehouseData);
        setWarehouses([...warehouses, res.data.data]);
        toast.success('Warehouse created successfully!');
      }
      setShowModal(false);
      setFormData({
        name: '',
        locationId: 0,
        aisleType: null,
        aisleCount: null,
        bayType: null,
        bayCount: null,
        levelType: null,
        levelCount: null,
        binType: null,
        binCount: null,
      });
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
                  onChange={(e) => setFormData({ ...formData, locationId: parseInt(e.target.value, 10) || 0 })}
                  required
                >
                  <option value="0">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>Storage Configuration</h4>
                
                {/* Aisle Configuration */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Aisle</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="aisleType">Type</label>
                      <select
                        id="aisleType"
                        value={formData.aisleType || ''}
                        onChange={(e) => setFormData({ ...formData, aisleType: e.target.value ? (e.target.value as 'numeric' | 'alphabetic') : null })}
                      >
                        <option value="">None</option>
                        <option value="numeric">Numeric</option>
                        <option value="alphabetic">Alphabetic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="aisleCount">Count</label>
                      <input
                        type="number"
                        id="aisleCount"
                        min="0"
                        value={formData.aisleCount || ''}
                        onChange={(e) => setFormData({ ...formData, aisleCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Bay Configuration */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Bay</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="bayType">Type</label>
                      <select
                        id="bayType"
                        value={formData.bayType || ''}
                        onChange={(e) => setFormData({ ...formData, bayType: e.target.value ? (e.target.value as 'numeric' | 'alphabetic') : null })}
                      >
                        <option value="">None</option>
                        <option value="numeric">Numeric</option>
                        <option value="alphabetic">Alphabetic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="bayCount">Count</label>
                      <input
                        type="number"
                        id="bayCount"
                        min="0"
                        value={formData.bayCount || ''}
                        onChange={(e) => setFormData({ ...formData, bayCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Level Configuration */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Level</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="levelType">Type</label>
                      <select
                        id="levelType"
                        value={formData.levelType || ''}
                        onChange={(e) => setFormData({ ...formData, levelType: e.target.value ? (e.target.value as 'numeric' | 'alphabetic') : null })}
                      >
                        <option value="">None</option>
                        <option value="numeric">Numeric</option>
                        <option value="alphabetic">Alphabetic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="levelCount">Count</label>
                      <input
                        type="number"
                        id="levelCount"
                        min="0"
                        value={formData.levelCount || ''}
                        onChange={(e) => setFormData({ ...formData, levelCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Bin Configuration */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Bin</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label htmlFor="binType">Type</label>
                      <select
                        id="binType"
                        value={formData.binType || ''}
                        onChange={(e) => setFormData({ ...formData, binType: e.target.value ? (e.target.value as 'numeric' | 'alphabetic') : null })}
                      >
                        <option value="">None</option>
                        <option value="numeric">Numeric</option>
                        <option value="alphabetic">Alphabetic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="binCount">Count</label>
                      <input
                        type="number"
                        id="binCount"
                        min="0"
                        value={formData.binCount || ''}
                        onChange={(e) => setFormData({ ...formData, binCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
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
