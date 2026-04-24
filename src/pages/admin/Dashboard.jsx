import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Package, ArrowUpRight,
  ArrowDownRight, Clock, CheckCircle, Truck, XCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '../../api/orderApi';
import { formatPrice, formatDate, ORDER_STATUS_CONFIG } from '../../utils/formatters';
import './Admin.css';

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <motion.div
    className={`stat-card stat-card-${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
  >
    <div className="stat-card-header">
      <div className="stat-icon">{icon}</div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
  </motion.div>
);

const STATUS_COLORS = {
  pending: '#F59E0B',
  processing: '#06B6D4',
  dispatched: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
  returned: '#6B7280',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, salesRes, topRes, statusRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getSalesChart({ period: 30 }),
          adminApi.getTopProducts(),
          adminApi.getOrderStatusStats(),
        ]);
        setStats(dashRes.data.stats);
        setSalesData(salesRes.data.salesData);
        setTopProducts(topRes.data.topProducts);
        setOrderStatus(statusRes.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const formattedSales = salesData.map((d) => ({
    date: d._id?.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="admin-dashboard page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back, Admin! Here's what's happening.</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/orders" className="btn btn-primary btn-sm" id="view-all-orders-btn">
            View All Orders
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          subtitle="All time"
          icon={<TrendingUp size={22} />}
          color="blue"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatPrice(stats?.monthRevenue || 0)}
          subtitle="This month"
          icon={<TrendingUp size={22} />}
          color="green"
          trend={stats?.monthGrowth}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || '0'}
          subtitle={`${stats?.pendingOrders} pending`}
          icon={<ShoppingBag size={22} />}
          color="purple"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          subtitle="Registered users"
          icon={<Users size={22} />}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        {/* Revenue chart */}
        <motion.div
          className="admin-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="chart-header">
            <h3>Revenue (Last 30 Days)</h3>
            <span className="chart-subtitle">Daily revenue trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={formattedSales}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [formatPrice(v), 'Revenue']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order status pie chart */}
        <motion.div
          className="admin-chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chart-header">
            <h3>Order Status</h3>
            <span className="chart-subtitle">Distribution overview</span>
          </div>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {orderStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry._id] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n, p) => [v, ORDER_STATUS_CONFIG[p.payload._id]?.label || p.payload._id]}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {orderStatus.map((entry) => (
                <div key={entry._id} className="pie-legend-item">
                  <span className="pie-dot" style={{ background: STATUS_COLORS[entry._id] }} />
                  <span>{ORDER_STATUS_CONFIG[entry._id]?.label || entry._id}</span>
                  <strong>{entry.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="admin-bottom-grid">
        {/* Recent orders */}
        <motion.div
          className="admin-table-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="chart-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all-link" id="recent-orders-view-all">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map ? stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/admin/orders`} className="order-link" id={`order-link-${order._id}`}>
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar">{order.user?.name?.[0]}</span>
                        {order.user?.name}
                      </div>
                    </td>
                    <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                    <td>
                      <span className={`badge status-${order.orderStatus}`}>
                        {ORDER_STATUS_CONFIG[order.orderStatus]?.icon} {ORDER_STATUS_CONFIG[order.orderStatus]?.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div
          className="admin-table-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="chart-header">
            <h3>Top Selling Products</h3>
            <Link to="/admin/products" className="view-all-link" id="top-products-view-all">View All</Link>
          </div>
          <div className="top-products-list">
            {topProducts.map((product, i) => (
              <div key={product._id} className="top-product-item">
                <div className="top-product-rank">#{i + 1}</div>
                <div className="top-product-img">
                  <img
                    src={product.images?.[0] || '/placeholder-part.jpg'}
                    alt={product.name}
                    onError={(e) => { e.target.src = '/placeholder-part.jpg'; }}
                  />
                </div>
                <div className="top-product-info">
                  <p className="top-product-name">{product.name}</p>
                  <span className="top-product-category">{product.category?.name}</span>
                </div>
                <div className="top-product-stats">
                  <span className="top-product-sold">{product.totalSold} sold</span>
                  <span className="top-product-price">{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
