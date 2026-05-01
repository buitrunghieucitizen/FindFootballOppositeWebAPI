import apiClient from './apiClient';

const ACCOUNT_API = '/account';

export const authService = {
  login: async (username, password, userRole) => {
    try {
      const response = await apiClient.post(`${ACCOUNT_API}/login`, {
        username,
        password,
        userRole,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.data.username,
          role: response.data.role,
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (username, fullName, phone, password, confirmPassword, userRole = 'Player') => {
    try {
      const response = await apiClient.post(`${ACCOUNT_API}/register`, {
        username,
        fullName,
        phone,
        password,
        confirmPassword,
        userRole,
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
