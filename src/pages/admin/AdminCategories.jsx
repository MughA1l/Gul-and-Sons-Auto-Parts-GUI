import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categoryApi } from '../../api/productApi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '', icon: '', parent: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await categoryApi.getCategories();
      setCategories(r.data.categories);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      parent: cat.parent?._id || ''
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditCategory(null);
    setFormData({ name: '', description: '', icon: '', parent: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => { if (formData[k]) fd.append(k, formData[k]); });

      if (editCategory) {
        await categoryApi.updateCategory(editCategory._id, fd);
        toast.success('Category updated');
      } else {
        await categoryApi.createCategory(fd);
        toast.success('Category created');
      }
      handleModalClose();
      fetchCategories();
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
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">Organize your parts catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Category
        </button>
      </div>
      
      <div className="admin-table-card">
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Icon</th><th>Name</th><th>Slug</th><th>Parent</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id}>
                    <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.slug}</code></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.parent?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => openEditModal(cat)}>
                          <Edit2 size={14} style={{ color: 'var(--primary)' }} />
                        </button>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => handleDelete(cat._id, cat.name)}>
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
            <button className="btn-icon-sm" onClick={handleModalClose} style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (Emoji or SVG text)</label>
                <input className="form-input" value={formData.icon} onChange={e => setFormData(p => ({...p, icon: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select className="form-select" value={formData.parent} onChange={e => setFormData(p => ({...p, parent: e.target.value}))}>
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => !editCategory || c._id !== editCategory._id).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Category'}
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
