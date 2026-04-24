import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { brandApi } from '../../api/productApi';
import { ChevronRight, Shield } from 'lucide-react';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandApi.getBrands()
      .then(r => setBrands(r.data.brands))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter" style={{ minHeight: '70vh', padding: '4rem 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="heading-lg">Top <span className="text-gradient">Brands</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Shop genuine parts from world-renowned manufacturers</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card skeleton" style={{ height: '120px' }} />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <Shield size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No brands found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {brands.map((brand, i) => (
              <motion.div
                key={brand._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/shop?brand=${brand._id}`}
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1rem', textDecoration: 'none', color: 'inherit', height: '100%' }}
                >
                  <div style={{ width: '50px', height: '50px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Shield size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{brand.name}</h3>
                    <div style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      View Parts <ChevronRight size={12} />
                    </div>
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
