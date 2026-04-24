import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, BarChart3,
  Wrench, LogOut, Menu, X, ChevronRight, Moon, Sun, MessageCircle
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const navItems = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/categories', icon: <Tag size={18} />, label: 'Categories' },
  { to: '/admin/brands', icon: <Tag size={18} />, label: 'Brands' },
  { to: '/admin/customers', icon: <Users size={18} />, label: 'Customers' },
  { to: '/admin/chat', icon: <MessageCircle size={18} />, label: 'Live Chat' },
  { to: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
];

export default function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((s) => s.auth);
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const location = useLocation();

  // Global socket for Admin notifications
  useEffect(() => {
    if (user?.role === 'admin' && accessToken) {
      const socket = io(SOCKET_URL, { auth: { token: accessToken } });
      socket.on('receive_message', (msg) => {
        const senderId = msg.sender?._id || msg.sender;
        if (!window.location.pathname.includes('/admin/chat') && senderId !== user._id) {
          setUnreadChatCount((c) => c + 1);
          toast.custom((t) => (
            <div className={`chat-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
              <div className="chat-toast-avatar">{msg.sender?.name?.[0] || 'C'}</div>
              <div className="chat-toast-content">
                <strong>{msg.sender?.name || 'Customer'} (Customer)</strong>
                <p>{msg.text || `Sent a ${msg.mediaType}`}</p>
              </div>
            </div>
          ));
        }
      });
      return () => socket.close();
    }
  }, [user, accessToken]);

  useEffect(() => {
    if (location.pathname.includes('/admin/chat')) {
      setUnreadChatCount(0);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/" className="sidebar-logo-link">
            <div className="sidebar-logo-icon"><Wrench size={18} /></div>
            <span>Auto<span>Parts</span></span>
          </Link>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} id="sidebar-close-btn">
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-admin-badge">
          <div className="sidebar-admin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>Administrator</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-section">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              id={`admin-nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === '/admin/chat' && unreadChatCount > 0 && (
                <span style={{ 
                  background: 'var(--danger)', color: 'white', fontSize: '0.7rem', 
                  padding: '2px 6px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 'bold' 
                }}>
                  {unreadChatCount}
                </span>
              )}
              {item.to !== '/admin/chat' && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="sidebar-footer">
          <button className="sidebar-action-btn" onClick={toggleTheme} id="admin-theme-toggle">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Link to="/" className="sidebar-action-btn" id="admin-view-store">
            <Package size={16} />
            <span>View Store</span>
          </Link>
          <button className="sidebar-action-btn text-danger" onClick={handleLogout} id="admin-logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="sidebar-toggle-btn"
          >
            <Menu size={20} />
          </button>

          <div className="admin-topbar-right">
            <Link to="/" className="btn btn-ghost btn-sm">← View Store</Link>
            <div className="admin-user-info">
              <div className="admin-user-avatar">{user?.name?.[0]}</div>
              <span>{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="admin-content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
