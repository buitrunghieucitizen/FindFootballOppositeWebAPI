import apiClient from './apiClient';

export const userProfileService = {
  getProfile: async () => {
    const res = await apiClient.get('/UserProfile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put('/UserProfile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await apiClient.put('/UserProfile/ChangePassword', data);
    return res.data;
  },
  uploadAvatar: async (formData) => {
    // Requires multipart/form-data
    const res = await apiClient.post('/UserProfile/UploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
