// Central API base URL — reads from Vite env variable.
// In development (.env.development): http://localhost:5000
// In production (.env.production):   '' (empty = same-origin, relative URLs)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default API_BASE;
