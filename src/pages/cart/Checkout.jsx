import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Package, MapPin, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { formatPrice, DELIVERY_CHARGE } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      country: 'Pakistan',
    },
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const total = subtotal + DELIVERY_CHARGE;

  const onSubmit = async (data) => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    try {
      const res = await orderApi.placeOrder({ shippingAddress: data, paymentMethod: 'cod' });
      setPlacedOrder(res.data.order);
      setStep(3);
      toast.success('🎉 Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Use saved address
  const handleUseAddress = (address) => {
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postalCode', address.postalCode);
  };

  if (step === 3 && placedOrder) {
    return (
      <div className="checkout-success-page">
        <motion.div
          className="checkout-success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle size={70} />
          </motion.div>
          <h1>Order Placed! 🎉</h1>
          <p className="success-order-num">Order #{placedOrder.orderNumber}</p>
          <p className="success-desc">
            Thank you for your order! You'll receive a confirmation shortly. Our team will contact you before delivery.
          </p>
          <div className="success-details">
            <div className="success-detail-row">
              <span>Payment Method</span>
              <span><Package size={14} /> Cash on Delivery</span>
            </div>
            <div className="success-detail-row">
              <span>Total Amount</span>
              <span><strong>{formatPrice(placedOrder.totalAmount)}</strong></span>
            </div>
            <div className="success-detail-row">
              <span>Estimated Delivery</span>
              <span><Truck size={14} /> 2-5 Business Days</span>
            </div>
          </div>
          <div className="success-actions">
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/profile/orders')}
              whileHover={{ scale: 1.02 }}
              id="view-orders-btn"
            >
              Track Your Order
            </motion.button>
            <motion.button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/shop')}
              whileHover={{ scale: 1.02 }}
              id="continue-shopping-success-btn"
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <div className="checkout-header">
          <h1 className="heading-lg">Checkout</h1>
          <div className="checkout-steps">
            <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span> Address
            </div>
            <ChevronRight size={14} className="step-arrow" />
            <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span> Review
            </div>
            <ChevronRight size={14} className="step-arrow" />
            <div className={`checkout-step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span> Done
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="checkout-layout">
            {/* Left side */}
            <div className="checkout-main">
              {/* Saved Addresses */}
              {user?.addresses?.length > 0 && (
                <div className="checkout-section">
                  <h3 className="checkout-section-title">
                    <MapPin size={18} /> Saved Addresses
                  </h3>
                  <div className="saved-addresses">
                    {user.addresses.map((addr) => (
                      <motion.div
                        key={addr._id}
                        className="saved-address-card"
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleUseAddress(addr)}
                        id={`use-address-${addr._id}`}
                      >
                        <div>
                          <strong>{addr.label}</strong>
                          <p>{addr.fullName} • {addr.phone}</p>
                          <p>{addr.street}, {addr.city}, {addr.state}</p>
                        </div>
                        <span className="use-address-btn">Use</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address Form */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">
                  <MapPin size={18} /> Shipping Address
                </h3>

                <div className="address-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className={`form-input ${errors.fullName ? 'error' : ''}`}
                      placeholder="Ali Ahmed" id="checkout-fullname"
                      {...register('fullName', { required: 'Full name is required' })} />
                    {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="03001234567" id="checkout-phone"
                      {...register('phone', { required: 'Phone is required' })} />
                    {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Street Address *</label>
                    <input className={`form-input ${errors.street ? 'error' : ''}`}
                      placeholder="House #, Street, Area" id="checkout-street"
                      {...register('street', { required: 'Street address is required' })} />
                    {errors.street && <span className="form-error">{errors.street.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className={`form-input ${errors.city ? 'error' : ''}`}
                      placeholder="Lahore" id="checkout-city"
                      {...register('city', { required: 'City is required' })} />
                    {errors.city && <span className="form-error">{errors.city.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Province *</label>
                    <select className={`form-select ${errors.state ? 'error' : ''}`}
                      id="checkout-state"
                      {...register('state', { required: 'Province is required' })}>
                      <option value="">Select Province</option>
                      {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan', 'AJK'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.state && <span className="form-error">{errors.state.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input className="form-input" placeholder="54000" id="checkout-postal"
                      {...register('postalCode')} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">
                  <Package size={18} /> Payment Method
                </h3>
                <div className="payment-option selected">
                  <div className="payment-option-radio" />
                  <div className="payment-option-info">
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay Rs. {formatPrice(total)} in cash when your order arrives</p>
                  </div>
                  <span className="payment-badge">✓ Selected</span>
                </div>
              </div>
            </div>

            {/* Right side - Order Summary */}
            <div className="checkout-sidebar">
              <div className="checkout-summary">
                <h3 className="checkout-section-title">Order Summary</h3>

                <div className="checkout-items-list">
                  {items.map((item) => (
                    <div key={item._id} className="checkout-item">
                      <div className="checkout-item-img">
                        <img
                          src={item.product?.images?.[0] || '/placeholder-part.jpg'}
                          alt={item.product?.name}
                          onError={(e) => { e.target.src = '/placeholder-part.jpg'; }}
                        />
                        <span className="checkout-item-qty">{item.quantity}</span>
                      </div>
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.product?.name}</p>
                      </div>
                      <span className="checkout-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery</span><span>{formatPrice(DELIVERY_CHARGE)}</span>
                  </div>
                  <div className="summary-row summary-row-total">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-accent place-order-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="place-order-btn"
                >
                  {loading ? <div className="btn-spinner" /> : (
                    <>
                      <Package size={18} />
                      Place Order (COD)
                    </>
                  )}
                </motion.button>

                <p className="checkout-note">
                  By placing this order, you agree to our terms and conditions.
                  Our team will call you to confirm before delivery.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
