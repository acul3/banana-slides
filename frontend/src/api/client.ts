import axios from 'axios';

// Development: forwarded through Vite proxy
// Production: forwarded through nginx proxy
const API_BASE_URL = '';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout (AI generation can be slow)
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // If request body is FormData, remove Content-Type to let browser set it automatically
    // Browser will automatically add correct Content-Type and boundary
    if (config.data instanceof FormData) {
      // Don't set Content-Type, let browser handle it
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else if (config.headers && !config.headers['Content-Type']) {
      // For non-FormData requests, default to JSON
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Unified error handling
    if (error.response) {
      // Server returned error status code
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request sent but no response received
      console.error('Network Error:', error.request);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Image URL processing utility
// Uses relative path, forwarded to backend through proxy
export const getImageUrl = (path?: string, timestamp?: string | number): string => {
  if (!path) return '';
  // If already a complete URL, return directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Use relative path (ensure starts with /)
  let url = path.startsWith('/') ? path : '/' + path;

  // Add timestamp parameter to avoid browser caching (only when timestamp is provided)
  if (timestamp) {
    const ts = typeof timestamp === 'string'
      ? new Date(timestamp).getTime()
      : timestamp;
    url += `?v=${ts}`;
  }

  return url;
};

export default apiClient;


