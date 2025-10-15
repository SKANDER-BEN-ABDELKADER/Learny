import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Token expiration handler
let tokenExpirationHandler = null;

// Set the token expiration handler (will be set by AuthContext)
export const setTokenExpirationHandler = (handler) => {
  tokenExpirationHandler = handler;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (tokenExpirationHandler) {
        tokenExpirationHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
