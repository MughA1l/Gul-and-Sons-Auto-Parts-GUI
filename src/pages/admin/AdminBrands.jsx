import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { brandApi } from '../../api/productApi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const r = await brandApi.getBrands();
      setBrands(r.data.brands);
    } catch (e) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    try {
      await brandApi.deleteBrand(id);
      setBrands(prev => prev.filter(c => c._id !== id));
      toast.success('Brand deleted');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const openEditModal = (brand) => {
    setEditBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || ''
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditBrand(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => { if (formData[k]) fd.append(k, formData[k]); });

      if (editBrand) {
        await brandApi.updateBrand(editBrand._id, fd);
        toast.success('Brand updated');
      } else {
        await brandApi.createBrand(fd);
        toast.success('Brand created');
      }
      handleModalClose();
      fetchBrands();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Brands</h1>
          <p className="admin-page-subtitle">Manage auto parts manufacturers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Brand
        </button>
      </div>
      
      <div className="admin-table-card">
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {brands.map(brand => (
                  <tr key={brand._id}>
                    <td style={{ fontWeight: 600 }}>{brand.name}</td>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{brand.slug}</code></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{brand.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => openEditModal(brand)}>
                          <Edit2 size={14} style={{ color: 'var(--primary)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => handleDelete(brand._id, brand.name)}>
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
            <button className="btn-icon-sm" onClick={handleModalClose} style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer', background: 'none', border: 'none' }}>
              <X size={18} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editBrand ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Brand'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={handleModalClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
