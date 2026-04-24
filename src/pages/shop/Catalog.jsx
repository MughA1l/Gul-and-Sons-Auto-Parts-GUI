import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, Search,
  Grid3X3, LayoutList, Filter,
} from 'lucide-react';
import { productApi, categoryApi, brandApi } from '../../api/productApi';
import { setFilters, resetFilters, setPage } from '../../store/slices/productSlice';
import ProductCard from '../../components/ui/ProductCard';
import { SORT_OPTIONS } from '../../utils/formatters';
import './Catalog.css';

const VEHICLE_MAKES = ['Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'BMW', 'Mercedes'];

export default function Catalog() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, currentPage } = useSelector((s) => s.products);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleYears, setVehicleYears] = useState([]);

  // Init filters from URL
  useEffect(() => {
    dispatch(setFilters({
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      year: searchParams.get('year') || '',
      sort: searchParams.get('sort') || 'newest',
    }));
  }, []);

  // Load reference data
  useEffect(() => {
    Promise.all([categoryApi.getCategories(), brandApi.getBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.categories);
        setBrands(brandRes.data.brands);
      });
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { ...filters, page: currentPage, limit: 12 };
        // Remove empty params
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        const res = await productApi.getProducts(params);
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, currentPage]);

  // Vehicle cascades
  useEffect(() => {
    if (filters.make) {
      productApi.getVehicles({ make: filters.make }).then(r => setVehicleModels(r.data.models));
    }
  }, [filters.make]);

  useEffect(() => {
    if (filters.make && filters.model) {
      productApi.getVehicles({ make: filters.make, model: filters.model }).then(r => setVehicleYears(r.data.years));
    }
  }, [filters.model]);

  const handleFilter = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (value) p.set(key, value); else p.delete(key);
      return p;
    });
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchParams({});
    setVehicleModels([]);
    setVehicleYears([]);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className="catalog-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="catalog-header">
          <div>
            <h1 className="heading-lg">
              {filters.keyword ? `"${filters.keyword}"` : filters.make ? `${filters.make}${filters.model ? ` ${filters.model}` : ''} Parts` : 'All Auto Parts'}
            </h1>
            {pagination && (
              <p className="catalog-count">{pagination.total.toLocaleString()} parts found</p>
            )}
          </div>

          <div className="catalog-controls">
            {/* Sort */}
            <select
              className="form-select sort-select"
              value={filters.sort}
              onChange={(e) => handleFilter('sort', e.target.value)}
              id="catalog-sort"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* View toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                id="grid-view-btn"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                id="list-view-btn"
              >
                <LayoutList size={16} />
              </button>
            </div>

            {/* Mobile filter toggle */}
            <motion.button
              className="btn btn-outline filter-toggle-btn"
              onClick={() => setFiltersOpen(!filtersOpen)}
              whileTap={{ scale: 0.97 }}
              id="mobile-filter-btn"
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </motion.button>
          </div>
        </div>

        <div className="catalog-layout">
          {/* Filters sidebar */}
          <AnimatePresence>
            <motion.aside
              className={`catalog-filters ${filtersOpen ? 'open' : ''}`}
              initial={false}
            >
              <div className="filters-header">
                <h3>Filters</h3>
                {activeFilterCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={handleReset} id="reset-filters-btn">
                    <X size={14} /> Clear All
                  </button>
                )}
              </div>

              {/* Vehicle filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">🚗 Find by Vehicle</h4>
                <div className="filter-selects">
                  <select className="form-select" value={filters.make}
                    onChange={(e) => { handleFilter('make', e.target.value); handleFilter('model', ''); handleFilter('year', ''); }}
                    id="filter-make">
                    <option value="">All Makes</option>
                    {VEHICLE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="form-select" value={filters.model}
                    onChange={(e) => { handleFilter('model', e.target.value); handleFilter('year', ''); }}
                    disabled={!filters.make || vehicleModels.length === 0}
                    id="filter-model">
                    <option value="">All Models</option>
                    {vehicleModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="form-select" value={filters.year}
                    onChange={(e) => handleFilter('year', e.target.value)}
                    disabled={!filters.model || vehicleYears.length === 0}
                    id="filter-year">
                    <option value="">All Years</option>
                    {vehicleYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Category filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="filter-options">
                  <button
                    className={`filter-option ${!filters.category ? 'active' : ''}`}
                    onClick={() => handleFilter('category', '')}
                    id="filter-cat-all"
                  >
                    All Categories
                  </button>
                  {categories.filter(c => !c.parent).slice(0, 10).map(cat => (
                    <button
                      key={cat._id}
                      className={`filter-option ${filters.category === cat._id ? 'active' : ''}`}
                      onClick={() => handleFilter('category', filters.category === cat._id ? '' : cat._id)}
                      id={`filter-cat-${cat.slug}`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand filter */}
              <div className="filter-group">
                <h4 className="filter-group-title">Brand</h4>
                <div className="filter-options">
                  <button className={`filter-option ${!filters.brand ? 'active' : ''}`}
                    onClick={() => handleFilter('brand', '')} id="filter-brand-all">
                    All Brands
                  </button>
                  {brands.slice(0, 12).map(brand => (
                    <button
                      key={brand._id}
                      className={`filter-option ${filters.brand === brand._id ? 'active' : ''}`}
                      onClick={() => handleFilter('brand', filters.brand === brand._id ? '' : brand._id)}
                      id={`filter-brand-${brand.slug}`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="filter-group">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min Rs."
                    value={filters.minPrice}
                    onChange={(e) => handleFilter('minPrice', e.target.value)}
                    id="filter-min-price"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max Rs."
                    value={filters.maxPrice}
                    onChange={(e) => handleFilter('maxPrice', e.target.value)}
                    id="filter-max-price"
                  />
                </div>
              </div>
            </motion.aside>
          </AnimatePresence>

          {/* Products area */}
          <div className="catalog-products">
            {loading ? (
              <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-empty">
                <Search size={60} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
                <h3>No parts found</h3>
                <p>Try adjusting your filters or search term</p>
                <button className="btn btn-outline" onClick={handleReset} id="catalog-reset-btn">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <motion.button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => dispatch(setPage(i + 1))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    id={`page-btn-${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
