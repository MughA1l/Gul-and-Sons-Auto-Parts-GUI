import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { adminApi } from '../../api/orderApi';
import { formatPrice } from '../../utils/formatters';
import './Admin.css';

export default function AdminAnalytics() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    Promise.all([
      adminApi.getSalesChart({ period }),
      adminApi.getTopProducts(),
    ]).then(([salesRes, topRes]) => {
      setSalesData(salesRes.data.salesData);
      setTopProducts(topRes.data.topProducts);
    }).catch(console.error);
  }, [period]);

  const formattedSales = salesData.map(d => ({
    date: d._id?.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">Sales trends and performance metrics</p>
        </div>
        <div className="admin-header-actions">
          {[7, 30, 90].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(p)} id={`period-${p}`}>
              {p} days
            </button>
          ))}
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <span className="chart-subtitle">Last {period} days</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={formattedSales}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [formatPrice(v), 'Revenue']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <div className="chart-header">
            <h3>Orders Count</h3>
            <span className="chart-subtitle">Daily orders</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={formattedSales}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={v => [v, 'Orders']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-table-card" style={{ marginTop: '1.5rem' }}>
        <div className="chart-header">
          <h3>Top Products</h3>
        </div>
        <div className="top-products-list">
          {topProducts.map((p, i) => (
            <div key={p._id} className="top-product-item">
              <div className="top-product-rank">#{i + 1}</div>
              <div className="top-product-info">
                <p className="top-product-name">{p.name}</p>
                <span className="top-product-category">{p.category?.name}</span>
              </div>
              <div className="top-product-stats">
                <span className="top-product-sold">{p.totalSold} sold</span>
                <span className="top-product-price">{formatPrice(p.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
