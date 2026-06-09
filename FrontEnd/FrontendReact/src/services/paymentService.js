import apiClient from './apiClient';

export const paymentService = {
  createPaymentLink: async (paymentData) => {
    // paymentData = { type: 'UserPremium' | 'TeamUpgrade' | 'PitchCreation', teamId?: number, pitchId?: number }
    const response = await apiClient.post('/Payment/CreatePaymentLink', paymentData);
    return response.data;
  },
  upgradeTeam: async () => {
    const response = await apiClient.post('/Payment/UpgradeTeam');
    return response.data;
  },
  upgradeOwner: async () => {
    const response = await apiClient.post('/Payment/UpgradeOwner');
    return response.data;
  }
};
