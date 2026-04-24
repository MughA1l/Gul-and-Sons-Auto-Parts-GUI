import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import CustomerChatWidget from './components/chat/CustomerChatWidget';
import { fetchCurrentUser, setInitialized } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/shop/Home'));
const Catalog = lazy(() => import('./pages/shop/Catalog'));
const Categories = lazy(() => import('./pages/shop/Categories'));
const Brands = lazy(() => import('./pages/shop/Brands'));
const ProductDetail = lazy(() => import('./pages/shop/ProductDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Checkout = lazy(() => import('./pages/cart/Checkout'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

// Loading fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    flexDirection: 'column',
    gap: '1rem',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin-slow 0.8s linear infinite',
    }} />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
  </div>
);

// Protected route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, initialized } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!initialized) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Customer layout
const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '70vh' }}>{children}</main>
    <Footer />
    <CustomerChatWidget />
  </>
);

export default function App() {
  const dispatch = useDispatch();
  const { accessToken, initialized } = useSelector((s) => s.auth);

  // Initialize auth on app load
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCurrentUser()).then(() => {
        dispatch(fetchCart());
      });
    }
    // If no token, main.jsx already dispatched setInitialized
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'white' },
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
          <Route path="/shop" element={<CustomerLayout><Catalog /></CustomerLayout>} />
          <Route path="/categories" element={<CustomerLayout><Categories /></CustomerLayout>} />
          <Route path="/brands" element={<CustomerLayout><Brands /></CustomerLayout>} />
          <Route path="/products/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
          <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected customer routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CustomerLayout><Checkout /></CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <CustomerLayout><Profile /></CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/orders" element={
            <ProtectedRoute>
              <CustomerLayout><Orders /></CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/orders/:id" element={
            <ProtectedRoute>
              <CustomerLayout><OrderDetail /></CustomerLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile/wishlist" element={
            <ProtectedRoute>
              <CustomerLayout><Wishlist /></CustomerLayout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminOrders /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminProducts /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/new" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminProductForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/:id/edit" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminProductForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminCategories /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/brands" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminBrands /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminCustomers /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/chat" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminChat /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminLayout><AdminAnalytics /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <CustomerLayout>
              <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1rem' }}>404</h1>
                <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            </CustomerLayout>
          } />
        </Routes>
      </Suspense>
    </>
  );
}
