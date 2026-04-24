import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Truck, X } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { formatPrice, formatDate, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    orderApi.getMyOrders().then(r => setOrders(r.data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await orderApi.cancelOrder(orderId, 'Cancelled by customer');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancellingId(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading orders...</div>;

  return (
    <div className="page-enter" style={{ minHeight: '80vh', padding: '2.5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h1 className="heading-lg" style={{ marginBottom: '2rem' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Package size={80} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1.5rem' }} />
            <h2>No orders yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn btn-primary btn-lg" id="orders-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order, i) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus] || {};
              return (
                <motion.div
                  key={order._id}
                  className="card"
                  style={{ padding: '1.5rem' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace' }}>#{order.orderNumber}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge status-${order.orderStatus}`} style={{ fontSize: '0.78rem' }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                      {['pending', 'processing'].includes(order.orderStatus) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(order._id)}
                          disabled={cancellingId === order._id}
                          id={`cancel-order-${order._id}`}
                        >
                          <X size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {order.items?.slice(0, 4).map(item => (
                      <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>+{order.items.length - 4} more</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'Space Grotesk' }}>{formatPrice(order.totalAmount)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {order.trackingId && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <Truck size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {order.courierName}: <code>{order.trackingId}</code>
                        </div>
                      )}
                      <Link to={`/profile/orders/${order._id}`} className="btn btn-outline btn-sm" id={`order-detail-${order._id}`}>
                        Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
