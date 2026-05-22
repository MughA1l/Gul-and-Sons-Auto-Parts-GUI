export default function BrandMark({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 38.5C12 36 13.8 33.8 16.3 33.4L20 32.8L25.8 24.6C26.9 23.1 28.7 22.2 30.6 22.2H40.5C43.2 22.2 45.7 23.8 46.8 26.2L49.4 31.9L53.1 32.7C55.2 33.1 57 34.8 57.4 37C57.8 39.4 56.8 41.6 55.1 42.9C54.2 43.6 53.1 44 52 44H14.8C13.1 44 12 42.7 12 41V38.5Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M17 34.5L21.8 27.8C23.3 25.7 25.7 24.5 28.3 24.5H39.7C42.3 24.5 44.7 25.7 46.2 27.8L51 34.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 35.5H49.6C52.1 35.5 54 37.4 54 39.9C54 42.4 52.1 44.3 49.6 44.3H14.4C12.4 44.3 11 42.7 11 40.8C11 38.7 12.7 37.1 15 35.5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="44" r="4.5" fill="currentColor" />
      <circle cx="46" cy="44" r="4.5" fill="currentColor" />
      <path
        d="M30 28.5H39"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}