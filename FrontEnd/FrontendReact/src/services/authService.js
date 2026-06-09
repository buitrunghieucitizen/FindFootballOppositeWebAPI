import apiClient from './apiClient';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/Account/Login', {
        username,
        password
      });
      const data = response.data;
      if (data.requires2FA || data.requiresSetup2FA) {
        return data;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          isPremium: data.isPremium,
          tokens: data.tokens || 0
        }));
      }
      return data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Sai tên đăng nhập hoặc mật khẩu!');
    }
  },

  verify2FA: async (username, password, code) => {
    try {
      const response = await apiClient.post('/Account/Verify2FALogin', { username, password, code });
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          isPremium: data.isPremium,
          tokens: data.tokens || 0
        }));
      }
      return data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Xác thực 2FA thất bại!');
    }
  },

  setup2FA: async (username, password) => {
    try {
      const response = await apiClient.post('/Account/Setup2FA', { username, password });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Lỗi cài đặt 2FA!');
    }
  },

  register: async (username, fullName, phone, password, confirmPassword, userRole = 'Player') => {
    try {
      const response = await apiClient.post('/Account/Register', {
        username,
        fullName,
        phone,
        password,
        confirmPassword,
        userRole
      });
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          isPremium: data.isPremium,
          tokens: data.tokens || 0
        }));
      }
      return data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Đăng ký thất bại!');
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

  updatePublicKey: async (publicKeyStr) => {
    try {
      const payload = { publicKey: publicKeyStr };
      const response = await apiClient.post('/Account/PublicKey', payload);
      return response.data;
    } catch (error) {
      console.error('Lỗi cập nhật PublicKey', error);
      throw error;
    }
  },

  getPublicKey: async (userId) => {
    try {
      const response = await apiClient.get(`/Account/PublicKey/${userId}`);
      return response.data.publicKey;
    } catch (error) {
      console.error("Lỗi lấy PublicKey", error);
      return null;
    }
  }
};
