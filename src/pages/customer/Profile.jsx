import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { User, MapPin, Plus, Edit2, Trash2, Check, Lock } from 'lucide-react';
import { userApi } from '../../api/orderApi';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi.getAddresses().then(r => setAddresses(r.data.addresses)).catch(console.error);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      fd.append('phone', profileForm.phone);
      await userApi.updateProfile(fd);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.changePassword(passwordForm);
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    try {
      const res = await userApi.addAddress(data);
      setAddresses(res.data.addresses);
      setShowAddAddress(false);
      toast.success('Address added!');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await userApi.deleteAddress(id);
      setAddresses(res.data.addresses);
      toast.success('Address deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <h1 className="heading-lg" style={{ marginBottom: '2rem' }}>My Profile</h1>

        <div className="profile-layout">
          {/* Sidebar tabs */}
          <div className="profile-sidebar">
            <div className="profile-avatar-card">
              <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            {[
              { id: 'profile', icon: <User size={16} />, label: 'Personal Info' },
              { id: 'addresses', icon: <MapPin size={16} />, label: 'Addresses' },
              { id: 'password', icon: <Lock size={16} />, label: 'Change Password' },
            ].map(t => (
              <button
                key={t.id}
                className={`profile-tab-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                id={`profile-tab-${t.id}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="profile-content card" style={{ padding: '2rem' }}>
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Personal Information</h2>
                <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} id="profile-name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email cannot be changed</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} id="profile-phone" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {tab === 'addresses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem' }}>Address Book</h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddAddress(true)} id="add-address-btn">
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map(addr => (
                    <div key={addr._id} className="address-card">
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong>{addr.label}</strong>
                          {addr.isDefault && <span className="badge badge-success">Default</span>}
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {addr.fullName} • {addr.phone}<br />
                          {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => handleDeleteAddress(addr._id)} id={`delete-addr-${addr._id}`}>
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                      No addresses saved yet.
                    </p>
                  )}
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Label</label>
                      <input className="form-input" name="label" placeholder="Home / Office / Workshop" defaultValue="Home" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" name="fullName" required defaultValue={user?.name} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input className="form-input" name="phone" required defaultValue={user?.phone} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Street *</label>
                      <input className="form-input" name="street" required placeholder="House #, Street, Area" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input className="form-input" name="city" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Province *</label>
                      <select className="form-select" name="state" required>
                        {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1', display: 'flex', gap: '0.75rem' }}>
                      <button type="submit" className="btn btn-primary" id="save-address-btn">Save Address</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setShowAddAddress(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {tab === 'password' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Change Password</h2>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '380px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} required id="current-password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} id="new-password" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} id="change-password-btn">
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
