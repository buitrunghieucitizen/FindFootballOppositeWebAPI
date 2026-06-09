import apiClient from './apiClient';

const playerService = {
  getMyTeam: async () => {
    return await apiClient.get('/Player/MyTeam');
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
  getPickupMatches: async () => {
    return await apiClient.get('/Player/PickupMatches');
  },
  joinPickupMatch: async (postId) => {
    return await apiClient.post(`/Player/JoinPickupMatch/${postId}`);
  },
  upgradePlayer: async () => {
    return await apiClient.post('/Player/Upgrade');
  }
};

export default playerService;
