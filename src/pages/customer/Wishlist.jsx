import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { userApi } from '../../api/orderApi';
import { updateUserWishlist } from '../../store/slices/authSlice';
import ProductCard from '../../components/ui/ProductCard';

export default function Wishlist() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getWishlist()
      .then(r => setProducts(r.data.wishlist))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter" style={{ minHeight: '80vh', padding: '2.5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 className="heading-lg" style={{ marginBottom: '2rem' }}>
          <Heart size={28} style={{ color: 'var(--danger)', display: 'inline', marginRight: '0.5rem' }} />
          My Wishlist
        </h1>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Heart size={80} style={{ color: 'var(--text-muted)', opacity: 0.2, margin: '0 auto 1.5rem' }} />
            <h2>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Save parts you love to buy later</p>
            <Link to="/shop" className="btn btn-primary btn-lg" id="wishlist-shop-btn">Browse Parts</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
