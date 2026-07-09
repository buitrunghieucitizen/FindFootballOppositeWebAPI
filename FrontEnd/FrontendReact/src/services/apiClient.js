import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:5229/api' : '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // COMMENTED OUT FOR MOCK UI TESTING SO WE DON'T GET KICKED OUT
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      
      // Do not redirect if we are already on the login page
      // if (window.location.pathname !== '/login') {
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
