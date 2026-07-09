import apiClient from './apiClient';

export const postService = {
  getPosts: async (type = '', page = 1) => {
    const res = await apiClient.get('/Post', { params: { type, page } });
    return res.data;
  },
  getPostById: async (id) => {
    const res = await apiClient.get(`/Post/${id}`);
    return res.data;
  },
  createPost: async (postData) => {
    const res = await apiClient.post('/Post', postData);
    return res.data;
  },
  updatePost: async (id, postData) => {
    const res = await apiClient.put(`/Post/${id}`, postData);
    return res.data;
  },
  deletePost: async (id) => {
    const res = await apiClient.delete(`/Post/${id}`);
    return res.data;
  }
};

export default postService;
