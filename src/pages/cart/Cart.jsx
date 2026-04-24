import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { formatPrice, getImageUrl, DELIVERY_CHARGE } from '../../utils/formatters';
import './Cart.css';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="cart-empty-page">
        <motion.div className="cart-empty" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingCart size={80} className="cart-empty-icon" />
          <h2>Please login to view your cart</h2>
          <p>Sign in to access your shopping cart</p>
          <Link to="/login" className="btn btn-primary btn-lg" id="cart-login-btn">Login to Continue</Link>
        </motion.div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + DELIVERY_CHARGE;

  if (!isLoading && items.length === 0) {
    return (
      <div className="cart-empty-page">
        <motion.div className="cart-empty" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag size={80} className="cart-empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add some auto parts to get started!</p>
          <Link to="/shop" className="btn btn-primary btn-lg" id="cart-shop-btn">Browse Parts</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="cart-header">
          <h1 className="heading-lg">Shopping Cart</h1>
          <span className="cart-item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <AnimatePresence>
              {items.map((item, i) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <motion.div
                    key={item._id}
                    className="cart-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.06 }}
                    layout
                  >
                    {/* Product image */}
                    <Link to={`/products/${product.slug || product._id}`} className="cart-item-image">
                      <img
                        src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder-part.jpg'}
                        alt={product.name}
                        onError={(e) => { e.target.src = '/placeholder-part.jpg'; }}
                      />
                    </Link>

                    {/* Product info */}
                    <div className="cart-item-info">
                      <Link to={`/products/${product.slug || product._id}`} className="cart-item-name">
                        {product.name}
                      </Link>
                      {product.partNumber && (
                        <span className="cart-item-sku">Part# {product.partNumber}</span>
                      )}
                      <span className="cart-item-unit-price">{formatPrice(item.price)} / unit</span>

                      {/* Quantity controls */}
                      <div className="cart-item-controls">
                        <div className="quantity-control">
                          <motion.button
                            className="qty-btn"
                            onClick={() => {
                              if (item.quantity > 1) {
                                dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }));
                              }
                            }}
                            disabled={item.quantity <= 1 || isLoading}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            id={`qty-minus-${item._id}`}
                          >
                            <Minus size={14} />
                          </motion.button>
                          <span className="qty-value">{item.quantity}</span>
                          <motion.button
                            className="qty-btn"
                            onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                            disabled={item.quantity >= product.stock || isLoading}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            id={`qty-plus-${item._id}`}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        <motion.button
                          className="remove-btn"
                          onClick={() => dispatch(removeFromCart(item._id))}
                          disabled={isLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          id={`remove-item-${item._id}`}
                        >
                          <Trash2 size={14} />
                          Remove
                        </motion.button>
                      </div>
                    </div>

                    {/* Item total */}
                    <div className="cart-item-total">
                      <span className="cart-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <motion.div
            className="cart-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="cart-summary-title">Order Summary</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charges</span>
                <span>{formatPrice(DELIVERY_CHARGE)}</span>
              </div>
              <div className="summary-row summary-row-total">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="cod-badge">
              <Package size={16} />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <p>Pay when you receive your order</p>
              </div>
            </div>

            <motion.button
              className="btn btn-primary checkout-btn"
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="proceed-to-checkout-btn"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </motion.button>

            <Link to="/shop" className="btn btn-ghost continue-shopping" id="continue-shopping-btn">
              ← Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
