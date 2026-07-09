import apiClient from './apiClient';

export const mediaService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/Media/Upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};
