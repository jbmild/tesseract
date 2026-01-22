import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { warehousesApi, locationsApi, warehouseExclusionsApi, Warehouse, Location, WarehouseExclusion, CreateWarehouseDto, CreateExclusionDto, ExclusionPossibleValues } from '../services/api';
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
  const [exclusions, setExclusions] = useState<WarehouseExclusion[]>([]);
  const [possibleValues, setPossibleValues] = useState<ExclusionPossibleValues>({
    aisle: [],
    bay: [],
    level: [],
    bin: [],
  });
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [editingExclusion, setEditingExclusion] = useState<WarehouseExclusion | null>(null);
  const [exclusionFormData, setExclusionFormData] = useState<CreateExclusionDto>({
    warehouseId: 0,
    aisleFrom: null,
    aisleTo: null,
    bayFrom: null,
    bayTo: null,
    levelFrom: null,
    levelTo: null,
    binFrom: null,
    binTo: null,
  });
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

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showExclusionModal) {
          setShowExclusionModal(false);
        } else if (showModal) {
          setShowModal(false);
          setExclusions([]);
          setEditingWarehouse(null);
        }
      }
    };

    if (showModal || showExclusionModal) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal, showExclusionModal]);

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

  const loadExclusions = async (warehouseId: number) => {
    try {
      const res = await warehouseExclusionsApi.getByWarehouse(warehouseId);
      setExclusions(res.data.data);
      if (res.data.possibleValues) {
        setPossibleValues(res.data.possibleValues);
      }
    } catch (error: any) {
      console.error('Failed to load exclusions:', error);
    }
  };

  const handleEdit = async (warehouse: Warehouse) => {
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
    await loadExclusions(warehouse.id);
    setShowModal(true);
  };

  const handleCreateExclusion = () => {
    if (!editingWarehouse) return;
    setEditingExclusion(null);
    setExclusionFormData({
      warehouseId: editingWarehouse.id,
      aisleFrom: null,
      aisleTo: null,
      bayFrom: null,
      bayTo: null,
      levelFrom: null,
      levelTo: null,
      binFrom: null,
      binTo: null,
    });
    setShowExclusionModal(true);
  };

  const handleEditExclusion = (exclusion: WarehouseExclusion) => {
    setEditingExclusion(exclusion);
    setExclusionFormData({
      warehouseId: exclusion.warehouseId,
      aisleFrom: exclusion.aisleFrom || null,
      aisleTo: exclusion.aisleTo || null,
      bayFrom: exclusion.bayFrom || null,
      bayTo: exclusion.bayTo || null,
      levelFrom: exclusion.levelFrom || null,
      levelTo: exclusion.levelTo || null,
      binFrom: exclusion.binFrom || null,
      binTo: exclusion.binTo || null,
    });
    setShowExclusionModal(true);
  };

  const handleDeleteExclusion = async (id: number) => {
    if (!editingWarehouse) return;
    try {
      await warehouseExclusionsApi.delete(id, editingWarehouse.id);
      toast.success('Exclusion deleted successfully!');
      await loadExclusions(editingWarehouse.id);
    } catch (error: any) {
      console.error('Failed to delete exclusion:', error);
      toast.error('Failed to delete exclusion');
    }
  };

  const handleExclusionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarehouse) return;

    // At least one dimension must have a from value specified
    if (!exclusionFormData.aisleFrom && !exclusionFormData.bayFrom && 
        !exclusionFormData.levelFrom && !exclusionFormData.binFrom) {
      toast.error('Please specify at least one dimension range for the exclusion.');
      return;
    }

    // Validate ranges: "to" must be >= "from" if both are specified
    const validateRange = (from: string | null | undefined, to: string | null | undefined, values: string[]) => {
      if (!from) return true; // No from means all
      if (!to) return true; // No to means single value or all after from
      
      const fromIndex = values.indexOf(from);
      const toIndex = values.indexOf(to);
      
      if (fromIndex === -1 || toIndex === -1) return false;
      return toIndex >= fromIndex;
    };

    if (!validateRange(exclusionFormData.aisleFrom, exclusionFormData.aisleTo, possibleValues.aisle) ||
        !validateRange(exclusionFormData.bayFrom, exclusionFormData.bayTo, possibleValues.bay) ||
        !validateRange(exclusionFormData.levelFrom, exclusionFormData.levelTo, possibleValues.level) ||
        !validateRange(exclusionFormData.binFrom, exclusionFormData.binTo, possibleValues.bin)) {
      toast.error('Invalid range: "To" value must be greater than or equal to "From" value.');
      return;
    }

    try {
      if (editingExclusion) {
        await warehouseExclusionsApi.update(editingExclusion.id, {
          ...exclusionFormData,
          warehouseId: editingWarehouse.id,
        });
        toast.success('Exclusion updated successfully!');
      } else {
        await warehouseExclusionsApi.create({
          ...exclusionFormData,
          warehouseId: editingWarehouse.id,
        });
        toast.success('Exclusion created successfully!');
      }
      setShowExclusionModal(false);
      await loadExclusions(editingWarehouse.id);
      setExclusionFormData({
        warehouseId: 0,
        aisleFrom: null,
        aisleTo: null,
        bayFrom: null,
        bayTo: null,
        levelFrom: null,
        levelTo: null,
        binFrom: null,
        binTo: null,
      });
      setEditingExclusion(null);
    } catch (error: any) {
      console.error('Failed to save exclusion:', error);
      toast.error('Failed to save exclusion');
    }
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
      setExclusions([]);
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
              <th>Name</th>
              <th>Location</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {!selectedClient || warehouses.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  {!selectedClient 
                    ? 'Please select a client to view warehouses' 
                    : `No warehouses found for ${selectedClient.name}`}
                </td>
              </tr>
            ) : (
              warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td>{warehouse.name}</td>
                  <td>{warehouse.location?.name || 'N/A'}</td>
                  <td>{new Date(warehouse.createdAt).toLocaleString(undefined, { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</td>
                  <td>{new Date(warehouse.updatedAt).toLocaleString(undefined, { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</td>
                  <td style={{ textAlign: 'right' }}>
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
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setExclusions([]);
          setEditingWarehouse(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}</h3>
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

              {/* Exclusions Section - Only show when editing existing warehouse */}
              {editingWarehouse && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>Storage Exclusions</h4>
                    <button 
                      type="button" 
                      onClick={handleCreateExclusion}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      + Add Exclusion
                    </button>
                  </div>
                  
                  {exclusions.length === 0 ? (
                    <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                      No exclusions defined. All storage locations are available.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Aisle</th>
                            <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Bay</th>
                            <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Level</th>
                            <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd' }}>Bin</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exclusions.map((exclusion) => {
                            const formatRange = (from: string | null | undefined, to: string | null | undefined) => {
                              if (!from) return 'All';
                              if (!to || from === to) return from;
                              return `${from} - ${to}`;
                            };
                            return (
                              <tr key={exclusion.id}>
                                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{formatRange(exclusion.aisleFrom, exclusion.aisleTo)}</td>
                                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{formatRange(exclusion.bayFrom, exclusion.bayTo)}</td>
                                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{formatRange(exclusion.levelFrom, exclusion.levelTo)}</td>
                                <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{formatRange(exclusion.binFrom, exclusion.binTo)}</td>
                                <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                                <button 
                                  type="button"
                                  onClick={() => handleEditExclusion(exclusion)}
                                  className="btn-edit"
                                  style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteExclusion(exclusion.id)}
                                  className="btn-delete"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowModal(false);
                  setExclusions([]);
                  setEditingWarehouse(null);
                }}>
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

      {/* Exclusion Modal */}
      {showExclusionModal && editingWarehouse && (
        <div className="modal-overlay" onClick={() => setShowExclusionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingExclusion ? 'Edit Exclusion' : 'Create Exclusion'}</h3>
            </div>
            <form onSubmit={handleExclusionSubmit}>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.9rem', color: '#1976d2' }}>
                <strong>Note:</strong> Leave a field empty to exclude all values for that dimension. At least one dimension must have a "From" value specified. "To" can be left empty for a single value exclusion.
              </div>
              
              {/* Aisle Range */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Aisle Range</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="exclusionAisleFrom">From</label>
                    <select
                      id="exclusionAisleFrom"
                      value={exclusionFormData.aisleFrom || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, aisleFrom: e.target.value || null })}
                    >
                      <option value="">All</option>
                      {possibleValues.aisle.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exclusionAisleTo">To</label>
                    <select
                      id="exclusionAisleTo"
                      value={exclusionFormData.aisleTo || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, aisleTo: e.target.value || null })}
                      disabled={!exclusionFormData.aisleFrom}
                    >
                      <option value="">Single value</option>
                      {possibleValues.aisle
                        .filter((val) => {
                          if (!exclusionFormData.aisleFrom) return false;
                          const fromIndex = possibleValues.aisle.indexOf(exclusionFormData.aisleFrom);
                          const valIndex = possibleValues.aisle.indexOf(val);
                          return valIndex >= fromIndex;
                        })
                        .map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bay Range */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Bay Range</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="exclusionBayFrom">From</label>
                    <select
                      id="exclusionBayFrom"
                      value={exclusionFormData.bayFrom || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, bayFrom: e.target.value || null })}
                    >
                      <option value="">All</option>
                      {possibleValues.bay.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exclusionBayTo">To</label>
                    <select
                      id="exclusionBayTo"
                      value={exclusionFormData.bayTo || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, bayTo: e.target.value || null })}
                      disabled={!exclusionFormData.bayFrom}
                    >
                      <option value="">Single value</option>
                      {possibleValues.bay
                        .filter((val) => {
                          if (!exclusionFormData.bayFrom) return false;
                          const fromIndex = possibleValues.bay.indexOf(exclusionFormData.bayFrom);
                          const valIndex = possibleValues.bay.indexOf(val);
                          return valIndex >= fromIndex;
                        })
                        .map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Level Range */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Level Range</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="exclusionLevelFrom">From</label>
                    <select
                      id="exclusionLevelFrom"
                      value={exclusionFormData.levelFrom || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, levelFrom: e.target.value || null })}
                    >
                      <option value="">All</option>
                      {possibleValues.level.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exclusionLevelTo">To</label>
                    <select
                      id="exclusionLevelTo"
                      value={exclusionFormData.levelTo || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, levelTo: e.target.value || null })}
                      disabled={!exclusionFormData.levelFrom}
                    >
                      <option value="">Single value</option>
                      {possibleValues.level
                        .filter((val) => {
                          if (!exclusionFormData.levelFrom) return false;
                          const fromIndex = possibleValues.level.indexOf(exclusionFormData.levelFrom);
                          const valIndex = possibleValues.level.indexOf(val);
                          return valIndex >= fromIndex;
                        })
                        .map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bin Range */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h5 style={{ marginBottom: '0.75rem', color: '#555' }}>Bin Range</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="exclusionBinFrom">From</label>
                    <select
                      id="exclusionBinFrom"
                      value={exclusionFormData.binFrom || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, binFrom: e.target.value || null })}
                    >
                      <option value="">All</option>
                      {possibleValues.bin.map((val) => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exclusionBinTo">To</label>
                    <select
                      id="exclusionBinTo"
                      value={exclusionFormData.binTo || ''}
                      onChange={(e) => setExclusionFormData({ ...exclusionFormData, binTo: e.target.value || null })}
                      disabled={!exclusionFormData.binFrom}
                    >
                      <option value="">Single value</option>
                      {possibleValues.bin
                        .filter((val) => {
                          if (!exclusionFormData.binFrom) return false;
                          const fromIndex = possibleValues.bin.indexOf(exclusionFormData.binFrom);
                          const valIndex = possibleValues.bin.indexOf(val);
                          return valIndex >= fromIndex;
                        })
                        .map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowExclusionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingExclusion ? 'Update' : 'Create'}
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
