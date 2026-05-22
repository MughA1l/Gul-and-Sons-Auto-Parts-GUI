import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Package, Truck, Shield, ChevronRight, Wrench } from 'lucide-react';
import { productApi, reviewApi } from '../../api/productApi';
import { addToCart } from '../../store/slices/cartSlice';
import { userApi } from '../../api/orderApi';
import { updateUserWishlist } from '../../store/slices/authSlice';
import ProductCard from '../../components/ui/ProductCard';
import { formatPrice, getImageUrl } from '../../utils/formatters';
import { getWhatsAppUrl } from '../../utils/contact';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { isLoading: cartLoading } = useSelector((s) => s.cart);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([
      productApi.getProduct(id),
      productApi.getRelated(id),
      reviewApi.getReviews(id),
    ]).then(([prodRes, relRes, revRes]) => {
      setProduct(prodRes.data.product);
      setRelated(relRes.data.products);
      setReviews(revRes.data.reviews);
      setIsWishlisted(user?.wishlist?.some(wid => wid === prodRes.data.product._id || wid?._id === prodRes.data.product._id));
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?._id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please login'); navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity }));
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); navigate('/login'); return; }
    try {
      const res = await userApi.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      dispatch(updateUserWishlist(res.data.wishlist));
      toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <div className="product-detail-skeleton">
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[300, 200, 150, 100].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '24px', width: `${w}px`, borderRadius: '6px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <h2>Product not found</h2>
      <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Shop</Link>
    </div>
  );

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent = product.discountPrice > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const inStock = product.stock > 0;
  const whatsappMessage = `Hello, I want to ask about ${product.name}${product.partNumber ? ` (Part ${product.partNumber})` : ''}.`;

  return (
    <div className="product-detail-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} />
          {product.category && <Link to={`/shop?category=${product.category._id}`}>{product.category.name}</Link>}
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        {/* Main product */}
        <div className="product-detail-main">
          {/* Images */}
          <div className="product-images">
            <motion.div className="product-main-image" layoutId={`product-img-${product._id}`}>
              <img
                src={product.images?.[selectedImage] ? getImageUrl(product.images[selectedImage]) : '/placeholder-part.jpg'}
                alt={product.name}
                onError={(e) => { e.target.src = '/placeholder-part.jpg'; }}
              />
              {discountPercent > 0 && (
                <span className="product-discount-badge">-{discountPercent}% OFF</span>
              )}
            </motion.div>
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    className={`thumbnail-btn ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ scale: 1.05 }}
                    id={`product-thumb-${i}`}
                  >
                    <img src={getImageUrl(img)} alt="" onError={(e) => { e.target.src = '/placeholder-part.jpg'; }} />
                  </motion.button>
                ))}
              </div>
            )}

            {product.videoUrl && (
              <div className="product-video-wrapper" style={{ marginTop: '1rem' }}>
                <iframe
                  title="product-video"
                  src={(() => {
                    try {
                      const url = product.videoUrl;
                      const ytMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
                      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
                      return url;
                    } catch (e) { return '' }
                  })()}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: 360, borderRadius: 12 }}
                />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-meta">
              {product.brand && <span className="product-brand-tag">{product.brand.name}</span>}
              {product.condition !== 'new' && (
                <span className="badge badge-warning">{product.condition}</span>
              )}
            </div>

            <h1 className="product-title">{product.name}</h1>

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="product-rating-row">
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(product.ratings.average) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span>{product.ratings.average}/5</span>
                <span>({product.ratings.count} reviews)</span>
              </div>
            )}

            {/* Part numbers */}
            <div className="product-part-numbers">
              {product.partNumber && <span><strong>Part#</strong> {product.partNumber}</span>}
              {product.oemNumber && <span><strong>OEM#</strong> {product.oemNumber}</span>}
            </div>

            {/* Price */}
            <div className="product-price-section">
              <span className="product-price">{formatPrice(effectivePrice)}</span>
              {discountPercent > 0 && (
                <span className="product-original-price">{formatPrice(product.price)}</span>
              )}
              {product.deliveryCharge > 0 && (
                <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Delivery: {formatPrice(product.deliveryCharge)}</div>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="product-short-desc">{product.shortDescription}</p>
            )}

            {/* Stock */}
            <div className={`product-stock-indicator ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              <Package size={16} />
              {inStock ? `✓ In Stock (${product.stock} units available)` : '✗ Out of Stock'}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="product-actions">
              {inStock && (
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn" id="detail-qty-minus">−</button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="qty-btn" id="detail-qty-plus">+</button>
                </div>
              )}
              <motion.button
                className="btn btn-primary add-cart-btn"
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
                whileHover={inStock ? { scale: 1.02 } : {}}
                whileTap={inStock ? { scale: 0.98 } : {}}
                id="product-add-to-cart"
              >
                <ShoppingCart size={18} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>
              <motion.button
                className={`btn btn-outline wishlist-action-btn ${isWishlisted ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="product-wishlist-btn"
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              <a
                href={getWhatsAppUrl(whatsappMessage)}
                className="btn btn-outline whatsapp-action-btn"
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

            {/* Features */}
            <div className="product-features">
              <div className="product-feature"><Truck size={16} /><span>2-5 Day Delivery</span></div>
              <div className="product-feature"><Shield size={16} /><span>Genuine Quality</span></div>
              <div className="product-feature"><Package size={16} /><span>Cash on Delivery</span></div>
            </div>

            {/* Fitments */}
            {product.fitments?.length > 0 && (
              <div className="product-fitments">
                <h4><Wrench size={16} /> Compatible Vehicles</h4>
                <div className="fitments-list">
                  {product.fitments.map((f, i) => (
                    <span key={i} className="fitment-tag">
                      {f.make} {f.model} ({f.yearFrom}–{f.yearTo})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tabs-header">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {product.description}
                </p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="tab-pane">
                {product.specifications?.length > 0 ? (
                  <table className="specs-table">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i}>
                          <th>{spec.key}</th>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: 'var(--text-muted)' }}>No specifications available.</p>}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="tab-pane">
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map(review => (
                      <div key={review._id} className="review-card">
                        <div className="review-header">
                          <div className="review-avatar">{review.user?.name?.[0]}</div>
                          <div>
                            <strong>{review.user?.name}</strong>
                            {review.isVerifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                          </div>
                          <div className="stars" style={{ marginLeft: 'auto' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={13} fill={i < review.rating ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                        {review.title && <h5 className="review-title">{review.title}</h5>}
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="related-products section">
            <div className="section-header">
              <h2 className="heading-lg">Related Parts</h2>
            </div>
            <div className="products-grid">
              {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
