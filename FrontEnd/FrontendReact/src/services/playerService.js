import apiClient from './apiClient';

const playerService = {
  getMyTeam: async () => {
    return await apiClient.get('/Player/MyTeam');
  },
  getMyTeams: async () => {
    return await apiClient.get('/Player/MyTeams');
  },
  leaveTeam: async () => {
    return await apiClient.post('/Player/LeaveTeam');
  },
  createTeam: async (data) => {
    // This usually goes to CaptainController but player might have endpoint to become captain
    return await apiClient.post('/Player/CreateTeam', data);
  },
  requestJoin: async (teamId) => {
    return await apiClient.post(`/Player/RequestJoin/${teamId}`);
  },
  getMyRequests: async () => {
    return await apiClient.get('/Player/MyRequests');
  },
  getIncomingRequests: async () => {
    return await apiClient.get('/Player/IncomingRequests');
  },
  acceptInvite: async (requestId) => {
    return await apiClient.post(`/Player/AcceptInvite/${requestId}`);
  },
  rejectInvite: async (requestId) => {
    return await apiClient.post(`/Player/RejectInvite/${requestId}`);
  },
  ratePlayer: async (playerId, ratingData) => {
    return await apiClient.post(`/Player/RatePlayer/${playerId}`, ratingData);
  },
  getNearbyTeams: async (params) => {
    return await apiClient.get('/Player/NearbyTeams', { params });
  },
  voteAttendance: async (matchId, status) => {
    return await apiClient.post(`/Player/VoteAttendance/${matchId}`, { isAttending: status });
  },
  getMatches: async () => {
    return await apiClient.get('/Player/Matches');
  },
  createIndividualMatch: async (data) => {
    return await apiClient.post('/Player/CreateIndividualMatch', data);
  },
  getMyPickupMatches: async () => {
    return await apiClient.get('/Player/MyPickupMatches');
  },
  deletePickupMatch: async (id) => {
    return await apiClient.delete(`/Player/DeletePickupMatch/${id}`);
  },
  getPickupMatches: async () => {
    return await apiClient.get('/Player/PickupMatches');
  },
  joinPickupMatch: async (postId) => {
    return await apiClient.post(`/Player/JoinPickupMatch/${postId}`);
  },
  upgradePlayer: async () => {
    return await apiClient.post('/Player/Upgrade');
  },
  
  getTournaments: async () => {
    const res = await apiClient.get('/Tournaments');
    return res.data;
  },

  getStadiums: async () => {
    const res = await apiClient.get('/Player/Stadiums');
    return res.data;
  },
  getStadiumDetails: async (id) => {
    const res = await apiClient.get(`/Player/Stadiums/${id}`);
    return res.data;
  },
  getPitchCalendar: async (pitchId, date) => {
    const res = await apiClient.get(`/Player/Pitches/${pitchId}/Calendar?date=${date}`);
    return res.data;
  },
  bookPitch: async (bookingData) => {
    const res = await apiClient.post('/Player/BookPitch', bookingData);
    return res.data;
  },
  bookRecurringPitch: async (bookingData) => {
    const res = await apiClient.post('/Player/BookRecurringPitch', bookingData);
    return res.data;
  },
  getBookingHistory: async () => {
    const res = await apiClient.get('/Player/BookingHistory');
    return res.data;
  },
  
  // Individual Matches Endpoints
  getIndividualMatches: async () => {
    const res = await apiClient.get('/Player/IndividualMatches');
    return res.data;
  },
  createIndividualMatch: async (data) => {
    const res = await apiClient.post('/Player/CreateIndividualMatch', data);
    return res.data;
  },
  deleteIndividualMatch: async (id) => {
    const res = await apiClient.delete(`/Player/DeleteIndividualMatch/${id}`);
    return res.data;
  },
  requestIndividualMatch: async (id, data) => {
    const res = await apiClient.post(`/Player/IndividualMatches/${id}/Request`, data);
    return res.data;
  },
  getIndividualMatchRequests: async () => {
    const res = await apiClient.get('/Player/IndividualMatchRequests');
    return res.data;
  },
  acceptIndividualMatchRequest: async (id) => {
    const res = await apiClient.post(`/Player/IndividualMatchRequests/${id}/Accept`);
    return res.data;
  },
  rejectIndividualMatchRequest: async (id) => {
    const res = await apiClient.post(`/Player/IndividualMatchRequests/${id}/Reject`);
    return res.data;
  },
  updateIndividualMatchScore: async (id, data) => {
    const res = await apiClient.put(`/Player/IndividualMatches/${id}/Score`, data);
    return res.data;
  },
  rateIndividualOpponent: async (id, data) => {
    const res = await apiClient.post(`/Player/IndividualMatches/${id}/RateOpponent`, data);
    return res.data;
  }
};

export default playerService;
