import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Shield, Truck, Headphones, RefreshCw,
  ChevronRight, Zap, Star, Package,
} from 'lucide-react';
import { productApi, categoryApi } from '../../api/productApi';
import ProductCard from '../../components/ui/ProductCard';
import './Home.css';

const VEHICLE_MAKES = ['Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'BMW', 'Mercedes'];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState({ make: '', model: '', year: '' });
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleYears, setVehicleYears] = useState([]);
  const [heroSearch, setHeroSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, topRes, catRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getTopSelling(),
          categoryApi.getCategories({ tree: true }),
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setTopSelling(topRes.data.products);
        setCategories(catRes.data.categories.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (vehicleFilter.make) {
      productApi.getVehicles({ make: vehicleFilter.make }).then((res) => {
        setVehicleModels(res.data.models);
        setVehicleFilter((p) => ({ ...p, model: '', year: '' }));
        setVehicleYears([]);
      });
    }
  }, [vehicleFilter.make]);

  useEffect(() => {
    if (vehicleFilter.make && vehicleFilter.model) {
      productApi.getVehicles({ make: vehicleFilter.make, model: vehicleFilter.model }).then((res) => {
        setVehicleYears(res.data.years);
        setVehicleFilter((p) => ({ ...p, year: '' }));
      });
    }
  }, [vehicleFilter.model]);

  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (vehicleFilter.make) params.set('make', vehicleFilter.make);
    if (vehicleFilter.model) params.set('model', vehicleFilter.model);
    if (vehicleFilter.year) params.set('year', vehicleFilter.year);
    navigate(`/shop?${params.toString()}`);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/shop?keyword=${encodeURIComponent(heroSearch)}`);
  };

  const features = [
    { icon: <Truck size={24} />, title: 'Fast Delivery', desc: 'Nationwide delivery within 2-5 business days', color: 'blue' },
    { icon: <Shield size={24} />, title: 'Genuine Parts', desc: '100% authentic OEM & aftermarket parts', color: 'green' },
    { icon: <Headphones size={24} />, title: '24/7 Support', desc: 'Expert technical support whenever you need', color: 'purple' },
    { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '7-day hassle-free return policy', color: 'orange' },
  ];

  const stats = [
    { value: '50,000+', label: 'Auto Parts' },
    { value: '25,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Brands' },
    { value: '15+', label: 'Cities Covered' },
  ];

  return (
    <div className="home-page page-enter">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Zap size={14} />
                Pakistan's #1 Auto Parts Platform
              </motion.div>

              <h1 className="hero-title">
                Find the <span className="text-gradient">Perfect Part</span>{' '}
                for Your <span className="hero-title-accent">Vehicle</span>
              </h1>

              <p className="hero-desc">
                Shop from 50,000+ genuine and aftermarket auto parts. Search by vehicle make,
                model, and year for a perfect fit every time.
              </p>

              {/* Hero search */}
              <form className="hero-search-form" onSubmit={handleHeroSearch}>
                <div className="hero-search-input-wrapper">
                  <Search size={18} className="hero-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by part name, OEM number, or brand..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="hero-search-input"
                    id="hero-search-input"
                  />
                </div>
                <motion.button
                  type="submit"
                  className="btn btn-primary hero-search-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="hero-search-submit"
                >
                  Search Parts
                  <ArrowRight size={16} />
                </motion.button>
              </form>

              {/* Quick links */}
              <div className="hero-quick-links">
                <span>Popular:</span>
                {categories.length > 0 ? categories.slice(0, 4).map((cat) => (
                  <Link key={cat._id} to={`/shop?category=${cat._id}`} className="hero-quick-link">
                    {cat.name}
                  </Link>
                )) : (
                  ['Engine Parts', 'Brakes', 'Filters'].map((term) => (
                    <Link key={term} to={`/shop?keyword=${term}`} className="hero-quick-link">
                      {term}
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            {/* Vehicle finder */}
            <motion.div
              className="vehicle-finder-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            >
              <div className="vehicle-finder-header">
                <h3>🚗 Find Parts for Your Car</h3>
                <p>Select your vehicle to see compatible parts</p>
              </div>

              <div className="vehicle-finder-body">
                <div className="form-group">
                  <label className="form-label">Make / Brand</label>
                  <select
                    className="form-select"
                    value={vehicleFilter.make}
                    onChange={(e) => setVehicleFilter({ make: e.target.value, model: '', year: '' })}
                    id="vehicle-make-select"
                  >
                    <option value="">Select Make</option>
                    {VEHICLE_MAKES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Model</label>
                  <select
                    className="form-select"
                    value={vehicleFilter.model}
                    onChange={(e) => setVehicleFilter((p) => ({ ...p, model: e.target.value, year: '' }))}
                    disabled={!vehicleFilter.make || vehicleModels.length === 0}
                    id="vehicle-model-select"
                  >
                    <option value="">Select Model</option>
                    {vehicleModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    className="form-select"
                    value={vehicleFilter.year}
                    onChange={(e) => setVehicleFilter((p) => ({ ...p, year: e.target.value }))}
                    disabled={!vehicleFilter.model || vehicleYears.length === 0}
                    id="vehicle-year-select"
                  >
                    <option value="">Select Year</option>
                    {vehicleYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  className="btn btn-accent vehicle-search-btn"
                  onClick={handleVehicleSearch}
                  disabled={!vehicleFilter.make}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  id="vehicle-search-btn"
                >
                  <Search size={16} />
                  Find Compatible Parts
                </motion.button>
              </div>

              <div className="vehicle-finder-footer">
                <Package size={14} />
                <span>50,000+ parts available for all major vehicles</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hero-stats">
          <div className="container">
            <div className="hero-stats-grid">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="hero-stat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="hero-stat-value">{stat.value}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section-sm">
        <div className="container">
          <div className="features-grid">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className={`feature-card feature-card-${feat.color}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <div className="feature-icon">{feat.icon}</div>
                <div>
                  <h4 className="feature-title">{feat.title}</h4>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="heading-lg">Shop by <span className="text-gradient">Category</span></h2>
              <p className="section-subtitle">Browse parts organized by category</p>
            </div>
            <Link to="/categories" className="btn btn-outline btn-sm">
              All Categories <ChevronRight size={14} />
            </Link>
          </div>

          <div className="categories-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="category-card-skeleton skeleton" />
                ))
              : categories.map((cat, i) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/shop?category=${cat._id}`}
                      className="category-card"
                      id={`category-${cat.slug}`}
                    >
                      <div className="category-icon">{cat.icon}</div>
                      <h4 className="category-name">{cat.name}</h4>
                      <ChevronRight size={14} className="category-arrow" />
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="heading-lg">
                <Zap size={24} style={{ color: 'var(--accent)', display: 'inline', marginRight: '8px' }} />
                Featured <span className="text-gradient">Parts</span>
              </h2>
              <p className="section-subtitle">Hand-picked top quality auto parts</p>
            </div>
            <Link to="/shop?featured=true" className="btn btn-outline btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="product-skeleton skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TOP SELLING ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="heading-lg">
                <Star size={22} style={{ color: 'var(--accent)', display: 'inline', marginRight: '8px' }} />
                Best <span className="text-gradient">Sellers</span>
              </h2>
              <p className="section-subtitle">Most popular parts ordered by customers</p>
            </div>
            <Link to="/shop?sort=popular" className="btn btn-outline btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="products-grid">
            {topSelling.slice(0, 8).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-orbs">
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />
            </div>
            <div className="cta-content">
              <h2 className="cta-title">Ready to Find Your Part?</h2>
              <p className="cta-desc">
                Browse 50,000+ parts from 500+ trusted brands. Cash on Delivery available nationwide.
              </p>
              <div className="cta-actions">
                <Link to="/shop" className="btn btn-accent btn-lg" id="cta-shop-btn">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} id="cta-register-btn">
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
