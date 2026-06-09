import apiClient from './apiClient';

const ADMIN_API = '/admin';

export const adminService = {
  getDashboardStats: async (timeframe = 'year') => {
    const res = await apiClient.get(`/Admin/DashboardStats?timeframe=${timeframe}`);
    return res.data;
  },

  // ===== Users =====
  getUsers: async (search = '', page = 1) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/Users`, {
        params: { search, page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/EditUser`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/CreateUser`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/EditUser`, userData, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/DeleteUser`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Teams =====
  getTeams: async (search = '', page = 1) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/Teams`, {
        params: { search, page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTeamById: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/EditTeam`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/CreateTeam`, teamData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/EditTeam`, teamData, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteTeam: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/DeleteTeam`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Stadiums =====
  getStadiums: async (search = '', page = 1) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/Stadiums`, {
        params: { search, page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStadiumById: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/EditStadium`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createStadium: async (stadiumData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/CreateStadium`, stadiumData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateStadium: async (id, stadiumData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/EditStadium`, stadiumData, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteStadium: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/DeleteStadium`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Matches =====
  getMatches: async (search = '', page = 1) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/Matches`, {
        params: { search, page },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMatchById: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/EditMatch`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createMatch: async (matchData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/CreateMatch`, matchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateMatch: async (id, matchData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/EditMatch`, matchData, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteMatch: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/DeleteMatch`, { params: { id } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Tournaments =====
  getTournaments: async () => {
    const res = await apiClient.get(`${ADMIN_API}/tournaments`);
    return res.data;
  },

  // ===== Posts =====
  getPendingPosts: async () => {
    const res = await apiClient.get(`${ADMIN_API}/posts/pending`);
    return res.data;
  },
  approvePost: async (id) => {
    const res = await apiClient.post(`${ADMIN_API}/posts/${id}/approve`);
    return res.data;
  },
  rejectPost: async (id) => {
    const res = await apiClient.post(`${ADMIN_API}/posts/${id}/reject`);
    return res.data;
  },

  // ===== Withdrawal Requests =====
  getWithdrawalRequests: async (status = 'All') => {
    const res = await apiClient.get(`/Admin/WithdrawalRequests?status=${status}`);
    return res.data;
  },
  approveWithdrawal: async (id, formData) => {
    const res = await apiClient.put(`/Admin/WithdrawalRequests/${id}/Approve`, formData);
    return res.data;
  },
  rejectWithdrawal: async (id) => {
    const res = await apiClient.put(`/Admin/WithdrawalRequests/${id}/Reject`);
    return res.data;
  }
};
