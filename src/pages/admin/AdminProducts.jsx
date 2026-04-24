import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({ keyword: search, page, limit: 15 });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">Manage your auto parts catalog</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/products/new" className="btn btn-primary" id="add-product-btn">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <input
          className="form-input"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
          id="admin-product-search"
        />
        <button type="submit" className="btn btn-outline btn-icon" id="admin-search-btn">
          <Search size={16} />
        </button>
      </form>

      <div className="admin-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Part #</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className="customer-cell">
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                          <img
                            src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder-part.jpg'}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = '/placeholder-part.jpg'; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{product.brand?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{product.partNumber || '—'}</code></td>
                    <td><span style={{ fontSize: '0.82rem' }}>{product.category?.name}</span></td>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.875rem' }}>{formatPrice(product.discountPrice || product.price)}</strong>
                        {product.discountPrice > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {product.isActive && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>}
                        {product.isFeatured && <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.1)', color: 'var(--accent)' }}>Featured</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Link to={`/admin/products/${product._id}/edit`} className="btn btn-ghost btn-icon-sm" id={`edit-product-${product._id}`}>
                          <Edit2 size={14} style={{ color: 'var(--primary)' }} />
                        </Link>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => handleDelete(product._id, product.name)} id={`delete-product-${product._id}`}>
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

        {pagination?.pages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem' }}>
            {Array.from({ length: pagination.pages }).map((_, i) => (
              <button key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)} id={`admin-page-${i + 1}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
