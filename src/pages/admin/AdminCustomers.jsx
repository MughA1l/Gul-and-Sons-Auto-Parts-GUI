import { useState, useEffect } from 'react';
import { adminApi } from '../../api/orderApi';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllUsers()
      .then(r => setUsers(r.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBlock = async (id, name, isBlocked) => {
    if (!confirm(`${isBlocked ? 'Unblock' : 'Block'} "${name}"?`)) return;
    try {
      await adminApi.toggleBlockUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u));
      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-enter">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">Manage registered users</p>
        </div>
      </div>
      <div className="admin-table-card">
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-avatar">{u.name?.[0]}</span>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : ''}`} style={{ fontSize: '0.7rem' }}>{u.role}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`badge ${u.isBlocked ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`btn btn-sm ${u.isBlocked ? 'btn-outline' : 'btn-danger'}`}
                          onClick={() => handleToggleBlock(u._id, u.name, u.isBlocked)}
                          id={`toggle-block-${u._id}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
