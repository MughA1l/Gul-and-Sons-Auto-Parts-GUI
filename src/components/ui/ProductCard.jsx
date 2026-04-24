import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Eye, Zap, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { userApi } from '../../api/orderApi';
import { updateUserWishlist } from '../../store/slices/authSlice';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { isLoading: cartLoading } = useSelector((s) => s.cart);

  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.some((id) => id === product._id || id?._id === product._id)
  );
  const [imgError, setImgError] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const inStock = product.stock > 0;
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (!inStock) return;
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist');
      navigate('/login');
      return;
    }
    setIsWishlistLoading(true);
    try {
      const res = await userApi.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      dispatch(updateUserWishlist(res.data.wishlist));
      toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -6 }}
      layout
    >
      <Link to={`/products/${product.slug || product._id}`} className="product-card-link">
        {/* Image */}
        <div className="product-card-image">
          <motion.img
            src={imgError || !product.images?.[0] ? '/placeholder-part.jpg' : getImageUrl(product.images[0])}
            alt={product.name}
            onError={() => setImgError(true)}
            loading="lazy"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Badges */}
          <div className="product-card-badges">
            {discountPercent > 0 && (
              <span className="product-badge discount-badge">
                <Zap size={10} />
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && (
              <span className="product-badge featured-badge">⭐ Featured</span>
            )}
            {!inStock && (
              <span className="product-badge out-of-stock-badge">Out of Stock</span>
            )}
          </div>

          {/* Overlay actions */}
          <div className="product-card-overlay">
            <motion.button
              className="overlay-btn wishlist-btn"
              onClick={handleWishlist}
              disabled={isWishlistLoading}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              id={`wishlist-${product._id}`}
            >
              <Heart
                size={16}
                fill={isWishlisted ? 'currentColor' : 'none'}
                className={isWishlisted ? 'wishlisted' : ''}
              />
            </motion.button>

            <motion.div
              className="overlay-btn view-btn"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye size={16} />
            </motion.div>
          </div>

          {/* Quick add shimmer */}
          <motion.button
            className="quick-add-btn"
            onClick={handleAddToCart}
            disabled={!inStock || cartLoading}
            whileHover={{ y: 0, opacity: 1 }}
            id={`quick-add-${product._id}`}
          >
            <ShoppingCart size={14} />
            {inStock ? 'Quick Add' : 'Out of Stock'}
          </motion.button>
        </div>

        {/* Info */}
        <div className="product-card-info">
          {/* Brand & Category */}
          <div className="product-card-meta">
            {product.brand && (
              <span className="product-brand">{product.brand.name || product.brand}</span>
            )}
            {product.partNumber && (
              <span className="product-part-number">#{product.partNumber}</span>
            )}
          </div>

          {/* Name */}
          <h3 className="product-card-name">{product.name}</h3>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="product-rating">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.round(product.ratings.average) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="rating-count">({product.ratings.count})</span>
            </div>
          )}

          {/* Stock indicator */}
          <div className="product-stock">
            <Package size={11} />
            <span className={inStock ? 'in-stock' : 'out-of-stock'}>
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Price */}
          <div className="product-card-price">
            <span className="price-current">{formatPrice(effectivePrice)}</span>
            {discountPercent > 0 && (
              <span className="price-original">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart button (full width) */}
      <div className="product-card-footer">
        <motion.button
          className={`btn ${inStock ? 'btn-primary' : 'btn-outline'} product-cart-btn`}
          onClick={handleAddToCart}
          disabled={!inStock || cartLoading}
          whileHover={inStock ? { scale: 1.02 } : {}}
          whileTap={inStock ? { scale: 0.98 } : {}}
          id={`add-to-cart-${product._id}`}
        >
          <ShoppingCart size={15} />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </motion.button>
      </div>
    </motion.div>
  );
}
