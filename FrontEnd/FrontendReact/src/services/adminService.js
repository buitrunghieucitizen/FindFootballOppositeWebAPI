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
      const response = await apiClient.get(`${ADMIN_API}/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`${ADMIN_API}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`${ADMIN_API}/users/${id}`);
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
      const response = await apiClient.get(`${ADMIN_API}/teams/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createTeam: async (teamData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/teams`, teamData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateTeam: async (id, teamData) => {
    try {
      // API doesn't have PUT /teams/{id}, so this might throw 404 if called
      const response = await apiClient.put(`${ADMIN_API}/teams/${id}`, teamData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteTeam: async (id) => {
    try {
      const response = await apiClient.delete(`${ADMIN_API}/teams/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Stadiums =====
  getStadiums: async (search = '', page = 1, month = null, year = null) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/stadiums`, {
        params: { search, page, month, year },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStadiumById: async (id) => {
    try {
      const response = await apiClient.get(`${ADMIN_API}/stadiums/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createStadium: async (stadiumData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/stadiums`, stadiumData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateStadium: async (id, stadiumData) => {
    try {
      const response = await apiClient.put(`${ADMIN_API}/stadiums/${id}`, stadiumData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteStadium: async (id) => {
    try {
      const response = await apiClient.delete(`${ADMIN_API}/stadiums/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  remindCommissionDebt: async () => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/RemindCommissionDebt`);
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
      const response = await apiClient.get(`${ADMIN_API}/matches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createMatch: async (matchData) => {
    try {
      const response = await apiClient.post(`${ADMIN_API}/matches`, matchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateMatch: async (id, matchData) => {
    try {
      // API doesn't have PUT /matches/{id}
      const response = await apiClient.put(`${ADMIN_API}/matches/${id}`, matchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteMatch: async (id) => {
    try {
      const response = await apiClient.delete(`${ADMIN_API}/matches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Tournaments =====
  getTournaments: async (search = '', page = 1) => {
    const res = await apiClient.get(`${ADMIN_API}/tournaments`, {
      params: { search, page }
    });
    return res.data;
  },
  approveTournament: async (id) => {
    const res = await apiClient.post(`${ADMIN_API}/tournaments/${id}/approve`);
    return res.data;
  },
  rejectTournament: async (id) => {
    const res = await apiClient.post(`${ADMIN_API}/tournaments/${id}/reject`);
    return res.data;
  },
  deleteTournament: async (id) => {
    const res = await apiClient.delete(`${ADMIN_API}/tournaments/${id}`);
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
  },

  // ===== Feedbacks =====
  getFeedbacks: async (status = '', page = 1) => {
    const res = await apiClient.get(`/Admin/Feedbacks`, { params: { status, page } });
    return res.data;
  },
  updateFeedbackStatus: async (id, status) => {
    const res = await apiClient.put(`/Admin/Feedbacks/${id}/Status`, { status });
    return res.data;
  }
};
