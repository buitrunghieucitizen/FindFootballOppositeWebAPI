import apiClient from './apiClient';

const sportService = {
  getSports: () => apiClient.get('/Sports')
};

export default sportService;
