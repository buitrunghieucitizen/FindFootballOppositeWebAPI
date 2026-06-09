import apiClient from './apiClient';

export const notificationService = {
  getNotifications: async () => {
    try {
      // Mock notifications
      await new Promise(r => setTimeout(r, 300));
      return [];
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      throw error;
    }
  },
  
  markAsRead: async (id) => {
    try {
      await new Promise(r => setTimeout(r, 300));
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      throw error;
    }
  }
};
