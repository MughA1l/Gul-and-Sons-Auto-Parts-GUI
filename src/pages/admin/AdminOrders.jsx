import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Truck } from 'lucide-react';
import { adminApi } from '../../api/orderApi';
import { formatPrice, formatDate, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Tracking Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ orderId: null, newStatus: '', trackingId: '', courierName: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    adminApi.getAllOrders(params)
      .then(r => setOrders(r.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === 'dispatched' || newStatus === 'shipped') {
      // Open modal to enter tracking info
      setTrackingForm({ orderId, newStatus, trackingId: '', courierName: '' });
      setShowTrackingModal(true);
    } else {
      // Direct update
      updateStatus(orderId, newStatus);
    }
  };

  const updateStatus = async (orderId, newStatus, trackingData = {}) => {
    try {
      await adminApi.updateOrderStatus(orderId, { orderStatus: newStatus, ...trackingData });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus, ...trackingData } : o));
      toast.success('Order status updated');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to update order');
      fetchOrders(); // refresh on failure to revert dropdown
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateStatus(trackingForm.orderId, trackingForm.newStatus, {
      trackingId: trackingForm.trackingId,
      courierName: trackingForm.courierName
    });
    setSaving(false);
    setShowTrackingModal(false);
  };

  const statuses = ['all', 'pending', 'processing', 'dispatched', 'delivered', 'cancelled'];

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => { setFilter(s); }}
            id={`filter-status-${s}`}
          >
            {ORDER_STATUS_CONFIG[s]?.icon} {s === 'all' ? 'All Orders' : ORDER_STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="admin-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status & Tracking</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><code style={{ fontWeight: 700, color: 'var(--primary)' }}>#{order.orderNumber}</code></td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar">{order.user?.name?.[0]}</span>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.user?.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{order.items?.length} items</span></td>
                    <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span className={`badge status-${order.orderStatus}`} style={{ fontSize: '0.75rem', alignSelf: 'flex-start' }}>
                          {ORDER_STATUS_CONFIG[order.orderStatus]?.icon} {ORDER_STATUS_CONFIG[order.orderStatus]?.label}
                        </span>
                        {order.trackingId && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Truck size={10} /> {order.courierName}: {order.trackingId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', minWidth: '130px' }}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        id={`update-status-${order._id}`}
                      >
                        {['pending', 'processing', 'dispatched', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{ORDER_STATUS_CONFIG[s]?.label || s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tracking Info Modal */}
      {showTrackingModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', position: 'relative' }}>
            <button className="btn-icon-sm" onClick={() => setShowTrackingModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer', background: 'none', border: 'none' }}>
              <X size={18} />
            </button>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Dispatch Order</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Enter tracking details to notify the customer.
            </p>

            <form onSubmit={handleTrackingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Courier Service *</label>
                <select className="form-select" value={trackingForm.courierName} onChange={e => setTrackingForm(p => ({...p, courierName: e.target.value}))} required>
                  <option value="">Select Courier</option>
                  <option value="TCS">TCS</option>
                  <option value="Leopards">Leopards Courier</option>
                  <option value="M&P">M&P</option>
                  <option value="CallCourier">CallCourier</option>
                  <option value="Trax">Trax</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tracking ID / Number *</label>
                <input className="form-input" value={trackingForm.trackingId} onChange={e => setTrackingForm(p => ({...p, trackingId: e.target.value}))} required placeholder="e.g. 1234567890" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
