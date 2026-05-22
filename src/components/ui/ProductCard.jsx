import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Eye, Zap, Package } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { userApi } from '../../api/orderApi';
import { updateUserWishlist } from '../../store/slices/authSlice';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import { getWhatsAppUrl } from '../../utils/contact';
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
  const whatsappMessage = `Hello, I want to ask about ${product.name}${product.partNumber ? ` (Part ${product.partNumber})` : ''}.`;

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

            <a
              href={getWhatsAppUrl(whatsappMessage)}
              className="overlay-btn whatsapp-btn"
              target="_blank"
              rel="noreferrer"
              title="Chat on WhatsApp"
              aria-label={`Chat on WhatsApp about ${product.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15l-1 4.9 5-1A10 10 0 1 0 12 2Zm0 18.2c-1.3 0-2.6-.3-3.7-.9l-.3-.1-2.9.6.6-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.2-1.8-.9-2-.9s-.5-.1-.7.2-.8.9-1 .9-.4 0-.7-.2a6.7 6.7 0 0 1-2-1.2 7.6 7.6 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.6l.3-.4c.1-.1.1-.3.2-.5s0-.4 0-.5-.7-1.7-.9-2.3c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.7 1 2.9c.1.2 1.8 2.7 4.4 3.8.6.3 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.8-.8 2.1-1.6.3-.8.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z" fill="currentColor" />
              </svg>
            </a>
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
        <div className="product-card-footer-actions">
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

          <a
            href={getWhatsAppUrl(whatsappMessage)}
            className="btn btn-outline product-whatsapp-btn"
            target="_blank"
            rel="noreferrer"
            aria-label={`Chat on WhatsApp about ${product.name}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1 4.9 5-1A10 10 0 1 0 12 2Zm0 18.2c-1.3 0-2.6-.3-3.7-.9l-.3-.1-2.9.6.6-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.2-1.8-.9-2-.9s-.5-.1-.7.2-.8.9-1 .9-.4 0-.7-.2a6.7 6.7 0 0 1-2-1.2 7.6 7.6 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.6l.3-.4c.1-.1.1-.3.2-.5s0-.4 0-.5-.7-1.7-.9-2.3c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.7 1 2.9c.1.2 1.8 2.7 4.4 3.8.6.3 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.8-.8 2.1-1.6.3-.8.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z" fill="currentColor" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
