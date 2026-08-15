import axios from 'axios';

// ---------------------------------------------------------------------------
// API Base URL resolution (priority order):
//   1. VITE_API_URL env var        (set this in Vercel: Settings → Environment Variables)
//   2. VITE_API_BASE_URL env var   (alias, also accepted)
//   3. Production fallback          → Render backend URL (embedded at build time)
//   4. Development fallback         → '/api'  (proxied by Vite dev server to localhost:5000)
// ---------------------------------------------------------------------------
const _envUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL;

const _resolvedUrl = _envUrl && !_envUrl.includes('your-render-service')
  ? _envUrl
  : (
      import.meta.env.PROD
        ? 'https://smart-parking-slot-reservation-system.onrender.com/api'
        : '/api'
    );

const API_BASE_URL = _resolvedUrl.replace(/\/$/, ''); // strip trailing slash

// Create Axios client pointing to the configured API endpoint
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to track token refreshing state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Inject Bearer Token to Request Headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept Responses to Auto-Refresh Expired Tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is unauthorized and has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If server specifically reported token expired
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          isRefreshing = false;
          // Redirect to login or logout
          return Promise.reject(error);
        }

        try {
          // Attempt token refresh from public auth endpoint
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          
          // Re-inject token to request
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Token expired or invalid, clear keys
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Force page reload to clear auth state
          window.location.href = '/login?expired=true';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
