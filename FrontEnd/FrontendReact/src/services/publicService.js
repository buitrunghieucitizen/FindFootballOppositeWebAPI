import apiClient from './apiClient';

export const publicService = {
  getPortalData: async () => {
    try {
      const response = await apiClient.get('/Home/Index');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ backend:', error);
      throw error;
    }
  }
};
