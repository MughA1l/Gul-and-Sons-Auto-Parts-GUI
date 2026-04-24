// Format price to Pakistani Rupees
export const formatPrice = (price) => {
  if (price === undefined || price === null) return 'Rs. 0';
  return `Rs. ${Number(price).toLocaleString('en-PK')}`;
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Truncate text
export const truncate = (text, length = 80) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '…' : text;
};

// Get image URL
export const getImageUrl = (path) => {
  if (!path) return '/placeholder-part.jpg';
  if (path.startsWith('http')) return path;
  return path;
};

// Order status config
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning', icon: '🕐' },
  processing: { label: 'Processing', color: 'info', icon: '⚙️' },
  dispatched: { label: 'Dispatched', color: 'primary', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'success', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'danger', icon: '❌' },
  returned: { label: 'Returned', color: 'muted', icon: '↩️' },
};

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
];

// Delivery charge
export const DELIVERY_CHARGE = 150;

// Generate star array
export const getStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= rating) return 'full';
    if (i + 0.5 <= rating) return 'half';
    return 'empty';
  });
};

// Build query string
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.set(key, value);
    }
  });
  return query.toString();
};
