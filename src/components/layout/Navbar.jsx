import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Sun, Moon, Menu, X, User, LogOut,
  Package, Heart, ChevronDown, Settings, LayoutDashboard, Wrench,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { logoutUser } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartItemCount);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Categories', to: '/categories' },
    { label: 'Brands', to: '/brands' },
    { label: 'Deals', to: '/shop?discounted=true' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      {/* Top bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-top-inner">
            <span className="navbar-tagline">
              🚗 Pakistan's #1 Auto Parts Store • Free delivery on orders above Rs. 5,000
            </span>
            <div className="navbar-top-actions">
              <span>📞 0300-1234567</span>
              <span>|</span>
              <span>✉️ support@autoparts.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="navbar-main">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <motion.div
                className="logo-icon"
                whileHover={{ rotate: 20 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Wrench size={22} />
              </motion.div>
              <span>
                Auto<span className="logo-accent">Parts</span>
                <span className="logo-pro"> Pro</span>
              </span>
            </Link>

            {/* Search bar */}
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search parts, OEM numbers, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
                id="navbar-search"
              />
              <motion.button
                type="submit"
                className="navbar-search-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="navbar-search-submit"
              >
                <Search size={18} />
              </motion.button>
            </form>

            {/* Desktop actions */}
            <div className="navbar-actions">
              {/* Theme toggle */}
              <motion.button
                className="btn btn-ghost btn-icon navbar-action-btn"
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Toggle theme"
                id="theme-toggle-btn"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Wishlist */}
              {isAuthenticated && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to="/profile/wishlist" className="btn btn-ghost btn-icon navbar-action-btn" title="Wishlist" id="wishlist-btn">
                    <Heart size={18} />
                  </Link>
                </motion.div>
              )}

              {/* Cart */}
              <motion.div
                className="navbar-cart-wrapper"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/cart" className="navbar-cart-btn" id="cart-btn">
                  <ShoppingCart size={20} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        className="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <motion.button
                    className="user-menu-trigger"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    whileHover={{ scale: 1.02 }}
                    id="user-menu-btn"
                  >
                    <div className="user-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user?.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="user-name hide-mobile">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`chevron ${userMenuOpen ? 'open' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="user-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="user-dropdown-header">
                          <strong>{user?.name}</strong>
                          <small>{user?.email}</small>
                        </div>
                        <div className="user-dropdown-divider" />
                        {user?.role === 'admin' && (
                          <Link to="/admin" className="user-dropdown-item" id="admin-dashboard-link">
                            <LayoutDashboard size={16} />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" className="user-dropdown-item" id="profile-link">
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link to="/profile/orders" className="user-dropdown-item" id="orders-link">
                          <Package size={16} />
                          My Orders
                        </Link>
                        <Link to="/profile/wishlist" className="user-dropdown-item" id="wishlist-menu-link">
                          <Heart size={16} />
                          Wishlist
                        </Link>
                        <div className="user-dropdown-divider" />
                        <button className="user-dropdown-item text-danger" onClick={handleLogout} id="logout-btn">
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline btn-sm" id="login-btn">Login</Link>
                  <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">Sign Up</Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <motion.button
                className="mobile-menu-btn btn btn-ghost btn-icon show-mobile"
                onClick={() => setMobileOpen(!mobileOpen)}
                whileTap={{ scale: 0.9 }}
                id="mobile-menu-toggle"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>

          {/* Nav links */}
          <div className="navbar-links hide-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container">
              <form className="mobile-search" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  id="mobile-search-input"
                />
                <button type="submit" className="btn btn-primary btn-icon" id="mobile-search-submit">
                  <Search size={16} />
                </button>
              </form>

              <div className="mobile-nav-links">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={link.to} className="mobile-nav-link">{link.label}</Link>
                  </motion.div>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="mobile-auth">
                  <Link to="/login" className="btn btn-outline" style={{ flex: 1 }} id="mobile-login-btn">Login</Link>
                  <Link to="/register" className="btn btn-primary" style={{ flex: 1 }} id="mobile-register-btn">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
