import apiClient from './apiClient';

export const notificationService = {
  getNotifications: async () => {
    try {
      const res = await apiClient.get('/UserProfile/Notifications');
      return res.data;
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      throw error;
    }
  },
  
  markAsRead: async (id) => {
    try {
      const res = await apiClient.put(`/UserProfile/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const res = await apiClient.put('/UserProfile/notifications/readall');
      return res.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
      throw error;
    }
  }
};
