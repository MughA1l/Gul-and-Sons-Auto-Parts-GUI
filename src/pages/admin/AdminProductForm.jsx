import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { productApi, categoryApi, brandApi } from '../../api/productApi';
import { getImageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    discountPrice: '0',
    stock: '',
    shortDescription: '',
    description: '',
    partNumber: '',
    oemNumber: '',
    condition: 'new',
    isActive: true,
    isFeatured: false,
  });

  const [fitments, setFitments] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    Promise.all([categoryApi.getCategories(), brandApi.getBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.categories);
        setBrands(brandRes.data.brands);
      });

    if (isEdit) {
      productApi.getProduct(id).then(res => {
        const p = res.data.product;
        setFormData({
          name: p.name,
          brand: p.brand?._id || '',
          category: p.category?._id || '',
          price: p.price,
          discountPrice: p.discountPrice || 0,
          stock: p.stock,
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          partNumber: p.partNumber || '',
          oemNumber: p.oemNumber || '',
          condition: p.condition || 'new',
          isActive: p.isActive !== false,
          isFeatured: p.isFeatured || false,
        });
        setFitments(p.fitments || []);
        setSpecifications(p.specifications || []);
        setExistingImages(p.images || []);
      }).catch(err => {
        toast.error('Failed to load product');
        navigate('/admin/products');
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (existingImages.length + images.length + filesArray.length > 8) {
        toast.error('Maximum 8 images allowed');
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      
      fd.append('fitments', JSON.stringify(fitments));
      fd.append('specifications', JSON.stringify(specifications));
      fd.append('existingImages', JSON.stringify(existingImages));

      images.forEach(img => fd.append('images', img));

      if (isEdit) {
        await productApi.updateProduct(id, fd);
        toast.success('Product updated successfully');
      } else {
        await productApi.createProduct(fd);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading product details...</div>;

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <Link to="/admin/products" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={14} /> Back to Products
          </Link>
          <h1 className="admin-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-layout">
        <div className="admin-form-main">
          {/* Basic Info */}
          <div className="admin-card">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Product Name *</label>
                <input className="form-input" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select className="form-select" name="brand" value={formData.brand} onChange={handleInputChange} required>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Regular Price (Rs) *</label>
                <input type="number" className="form-input" name="price" value={formData.price} onChange={handleInputChange} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Price (Rs)</label>
                <input type="number" className="form-input" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input type="number" className="form-input" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-select" name="condition" value={formData.condition} onChange={handleInputChange}>
                  <option value="new">New</option>
                  <option value="used">Used / Refurbished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="admin-card">
            <h3>Part Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Part Number</label>
                <input className="form-input" name="partNumber" value={formData.partNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label">OEM Number</label>
                <input className="form-input" name="oemNumber" value={formData.oemNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Short Description</label>
                <textarea className="form-input" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={2} />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="admin-card">
            <h3>Product Images</h3>
            <div className="image-upload-area">
              <label className="image-upload-btn">
                <ImageIcon size={24} />
                <span>Click to Upload Images (Max 8)</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
            
            <div className="image-preview-grid">
              {existingImages.map((img, i) => (
                <div key={`ext-${i}`} className="image-preview-item">
                  <img src={getImageUrl(img)} alt="Product" />
                  <button type="button" className="remove-img-btn" onClick={() => removeImage(i, true)}><X size={14}/></button>
                </div>
              ))}
              {images.map((img, i) => (
                <div key={`new-${i}`} className="image-preview-item">
                  <img src={URL.createObjectURL(img)} alt="New Product" />
                  <button type="button" className="remove-img-btn" onClick={() => removeImage(i, false)}><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="admin-form-sidebar">
          <div className="admin-card">
            <h3>Publishing</h3>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                Active (Visible on website)
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} />
                Featured Product
              </label>
            </div>
            <button type="submit" className="btn btn-primary full-width mt-3" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Save Product')}
            </button>
          </div>

          {/* Fitment */}
          <div className="admin-card">
            <div className="flex-between">
              <h3>Vehicle Fitment</h3>
              <button type="button" className="btn btn-ghost btn-icon-sm" onClick={() => setFitments(p => [...p, { make: '', model: '', yearFrom: '', yearTo: '' }])}>
                <Plus size={16} />
              </button>
            </div>
            <div className="dynamic-list">
              {fitments.map((fit, i) => (
                <div key={i} className="dynamic-item">
                  <div className="dynamic-item-inputs">
                    <input className="form-input form-input-sm" placeholder="Make (e.g. Honda)" value={fit.make} onChange={(e) => {
                      const n = [...fitments]; n[i].make = e.target.value; setFitments(n);
                    }} />
                    <input className="form-input form-input-sm" placeholder="Model (e.g. Civic)" value={fit.model} onChange={(e) => {
                      const n = [...fitments]; n[i].model = e.target.value; setFitments(n);
                    }} />
                    <div className="flex-row">
                      <input className="form-input form-input-sm" placeholder="Year From" value={fit.yearFrom} onChange={(e) => {
                        const n = [...fitments]; n[i].yearFrom = e.target.value; setFitments(n);
                      }} />
                      <input className="form-input form-input-sm" placeholder="Year To" value={fit.yearTo} onChange={(e) => {
                        const n = [...fitments]; n[i].yearTo = e.target.value; setFitments(n);
                      }} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-icon-sm text-danger" onClick={() => setFitments(p => p.filter((_, idx) => idx !== i))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {fitments.length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No fitments added.</p>}
            </div>
          </div>

          {/* Specifications */}
          <div className="admin-card">
            <div className="flex-between">
              <h3>Specifications</h3>
              <button type="button" className="btn btn-ghost btn-icon-sm" onClick={() => setSpecifications(p => [...p, { key: '', value: '' }])}>
                <Plus size={16} />
              </button>
            </div>
            <div className="dynamic-list">
              {specifications.map((spec, i) => (
                <div key={i} className="dynamic-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input className="form-input form-input-sm" placeholder="Key (e.g. Material)" value={spec.key} onChange={(e) => {
                    const n = [...specifications]; n[i].key = e.target.value; setSpecifications(n);
                  }} />
                  <input className="form-input form-input-sm" placeholder="Value" value={spec.value} onChange={(e) => {
                    const n = [...specifications]; n[i].value = e.target.value; setSpecifications(n);
                  }} />
                  <button type="button" className="btn btn-ghost btn-icon-sm text-danger" onClick={() => setSpecifications(p => p.filter((_, idx) => idx !== i))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {specifications.length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No specifications added.</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
