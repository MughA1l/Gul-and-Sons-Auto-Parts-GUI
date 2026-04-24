import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryApi } from '../../api/productApi';
import { ChevronRight, Package } from 'lucide-react';
import '../shop/Home.css'; // Reuse some CSS if needed or just use inline/classes

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getCategories()
      .then(r => setCategories(r.data.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter" style={{ minHeight: '70vh', padding: '4rem 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="heading-lg">All <span className="text-gradient">Categories</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Browse our wide range of auto parts by category</p>
        </div>

        {loading ? (
          <div className="categories-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="category-card-skeleton skeleton" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <Package size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/shop?category=${cat._id}`}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center', height: '100%', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{cat.icon || '📦'}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{cat.name}</h3>
                  {cat.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.description}</p>}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    Browse <ChevronRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
