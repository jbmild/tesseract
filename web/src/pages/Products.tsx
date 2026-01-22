import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productsApi, Product, CreateProductDto } from '../services/api';
import { useClient } from '../contexts/ClientContext';
import ConfirmDialog from '../components/ConfirmDialog';
import './Management.css';

export default function Products() {
  const { clientChangeKey, selectedClient } = useClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDto>({
    sku: '',
    code: '',
    barcode: null,
    name: '',
    description: null,
    width: null,
    height: null,
    depth: null,
  });

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
      const res = await productsApi.getAll();
      if (res?.data?.data) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setProducts([]);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Oops! We couldn't load the products list. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Error: ${errorMessage}`}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedClient) {
      toast.error('Please select a client first to create a product.');
      return;
    }
    setEditingProduct(null);
    setFormData({
      sku: '',
      code: '',
      barcode: null,
      name: '',
      description: null,
      width: null,
      height: null,
      depth: null,
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      code: product.code,
      barcode: product.barcode || null,
      name: product.name,
      description: product.description || null,
      width: product.width || null,
      height: product.height || null,
      depth: product.depth || null,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete === null) return;

    try {
      await productsApi.delete(productToDelete);
      toast.success('Product deleted successfully!');
      setProducts(products.filter((p) => p.id !== productToDelete));
      setShowConfirmDialog(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      toast.error(`Failed to delete product. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : errorMessage}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku.trim()) {
      toast.error('Please enter a SKU.');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Please enter a product code.');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    try {
      const productData: CreateProductDto = {
        sku: formData.sku.trim(),
        code: formData.code.trim(),
        barcode: formData.barcode?.trim() || null,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        width: formData.width ? parseInt(formData.width.toString(), 10) : null,
        height: formData.height ? parseInt(formData.height.toString(), 10) : null,
        depth: formData.depth ? parseInt(formData.depth.toString(), 10) : null,
      };

      if (editingProduct) {
        const res = await productsApi.update(editingProduct.id, productData);
        setProducts(products.map((p) => (p.id === editingProduct.id ? res.data.data : p)));
        toast.success('Product updated successfully!');
      } else {
        const res = await productsApi.create(productData);
        setProducts([...products, res.data.data]);
        toast.success('Product created successfully!');
      }
      setShowModal(false);
      setFormData({
        sku: '',
        code: '',
        barcode: null,
        name: '',
        description: null,
        width: null,
        height: null,
        depth: null,
      });
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const errorMessage = error.response?.data?.error || error.message || 'connection issue';
      if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to save product. ${errorMessage === 'connection issue' ? 'Please check your internet connection and try again.' : `Please check your input and try again. ${errorMessage}`}`);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Safety check - ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="management">
      <div className="management-header">
        <h2>Products Management</h2>
        <button onClick={handleCreate} className="btn-primary" disabled={!selectedClient}>
          + Add Product
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
          ⚠️ Please select a client to view and manage products.
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Code</th>
              <th>Name</th>
              <th>Created</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!selectedClient || safeProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  {!selectedClient 
                    ? 'Please select a client to view products' 
                    : `No products found for ${selectedClient?.name || 'selected client'}`}
                </td>
              </tr>
            ) : (
              safeProducts.map((product) => {
                if (!product || !product.id) {
                  return null;
                }
                
                return (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{new Date(product.createdAt).toLocaleString(undefined, { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</td>
                    <td>{new Date(product.updatedAt).toLocaleString(undefined, { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</td>
                    <td>
                      <button onClick={() => handleEdit(product)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDeleteClick(product.id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <h3>{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="sku">SKU *</label>
                <input
                  type="text"
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  placeholder="Enter SKU"
                />
              </div>
              <div className="form-group">
                <label htmlFor="code">Code *</label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="Enter product code"
                />
              </div>
              <div className="form-group">
                <label htmlFor="barcode">Barcode</label>
                <input
                  type="text"
                  id="barcode"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value || null })}
                  placeholder="Enter barcode (optional)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  placeholder="Enter product description (optional)"
                  rows={3}
                />
              </div>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>Size Dimensions (cm)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="width">Width (cm)</label>
                    <input
                      type="number"
                      id="width"
                      step="1"
                      min="0"
                      value={formData.width || ''}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value ? parseInt(e.target.value, 10) : null })}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      step="1"
                      min="0"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value, 10) : null })}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="depth">Depth (cm)</label>
                    <input
                      type="number"
                      id="depth"
                      step="1"
                      min="0"
                      value={formData.depth || ''}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value ? parseInt(e.target.value, 10) : null })}
                      placeholder="0"
                    />
                  </div>
                </div>
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
                    ℹ️ This product will be associated with <strong>{selectedClient.name}</strong>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
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
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
