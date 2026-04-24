import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, XCircle, Clock } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { formatPrice, formatDate, ORDER_STATUS_CONFIG, getImageUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getOrder(id)
      .then(res => setOrder(res.data.order))
      .catch(err => {
        toast.error('Order not found');
        navigate('/profile/orders');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading order details...</div>;
  if (!order) return null;

  const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus] || {};

  return (
    <div className="page-enter" style={{ minHeight: '80vh', padding: '2.5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/profile/orders" className="btn btn-ghost btn-icon" id="back-to-orders">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="heading-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Order <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{order.orderNumber}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 300px' }}>
          
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Status Card */}
            <div className="card" style={{ padding: '1.5rem', borderTop: `4px solid ${statusConfig.color || 'var(--primary)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${statusConfig.color}20`, color: statusConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {statusConfig.icon || <Package size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{statusConfig.label}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {order.orderStatus === 'dispatched' ? 'Your order is on the way!' : 'We are processing your order.'}
                    </p>
                  </div>
                </div>
                {order.trackingId && (
                  <div style={{ textAlign: 'right', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tracking details</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginTop: '0.2rem' }}>
                      <Truck size={14} style={{ color: 'var(--primary)' }} />
                      {order.courierName}: <code>{order.trackingId}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <img src={getImageUrl(item.image) || '/placeholder-part.jpg'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/products/${item.product}`} style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{item.name}</Link>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Part No: {item.partNumber || 'N/A'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{formatPrice(item.price)}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Summary */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                  <span>{formatPrice(order.deliveryCharges)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>{formatPrice(order.totalAmount)}</span>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  Payment: Cash on Delivery (COD)
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} /> Shipping Details
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>{order.shippingAddress.fullName}</strong>
                <div>{order.shippingAddress.phone}</div>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
