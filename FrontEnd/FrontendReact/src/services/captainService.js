import apiClient from './apiClient';

export const captainService = {
  getMyTeam: async () => {
    const res = await apiClient.get('/Captain/MyTeam');
    return res.data;
  },
  createTeam: async (teamData) => {
    const res = await apiClient.post('/Captain/CreateTeam', teamData);
    return res.data;
  },
  updateTeam: async (teamData) => {
    const res = await apiClient.put('/Captain/UpdateTeam', teamData);
    return res.data;
  },
  transferRole: async (transferData) => {
    const res = await apiClient.post('/Captain/TransferRole', transferData);
    return res.data;
  },
  getMembers: async () => {
    const res = await apiClient.get('/Captain/Members');
    return res.data;
  },
  getJoinRequests: async () => {
    const res = await apiClient.get('/Captain/JoinRequests');
    return res.data;
  },
  acceptMember: async (requestId) => {
    const res = await apiClient.post(`/Captain/AcceptMember/${requestId}`);
    return res.data;
  },
  rejectMember: async (requestId) => {
    const res = await apiClient.post(`/Captain/RejectMember/${requestId}`);
    return res.data;
  },
  getMatches: async () => {
    const res = await apiClient.get('/Captain/Matches');
    return res.data;
  },
  getMatchAttendance: async (matchId) => {
    const res = await apiClient.get(`/Captain/Matches/${matchId}/Attendance`);
    return res.data;
  },
  createChallenge: async (data) => {
    const res = await apiClient.post('/Captain/CreateChallenge', data);
    return res.data;
  },
  getChallengeRequests: async () => {
    const res = await apiClient.get('/Captain/ChallengeRequests');
    return res.data;
  },
  acceptChallenge: async (id) => {
    const res = await apiClient.post(`/Captain/AcceptChallenge/${id}`);
    return res.data;
  },
  cancelMatch: async (id, reason) => {
    const res = await apiClient.post(`/Captain/Matches/${id}/Cancel`, { reason });
    return res.data;
  },
  markAsExternalPitch: async (id) => {
    const res = await apiClient.post(`/Captain/Matches/${id}/ExternalPitch`);
    return res.data;
  },
  rateOpponent: async (data) => {
    const res = await apiClient.post('/Captain/RateOpponent', data);
    return res.data;
  },
  getMatchChats: async (id) => {
    const res = await apiClient.get(`/Captain/Matches/${id}/Chats`);
    return res.data;
  },
  getTeamRankings: async () => {
    const res = await apiClient.get('/Captain/TeamRankings');
    return res.data;
  },
  getPosts: async () => {
    const res = await apiClient.get('/Captain/Posts');
    return res.data;
  },
  createPost: async (postData) => {
    const res = await apiClient.post('/Captain/Posts', postData);
    return res.data;
  },
  createRecruitment: async (recruitmentData) => {
    const res = await apiClient.post('/Captain/CreateRecruitment', recruitmentData);
    return res.data;
  },
  uploadMedia: async (formData) => {
    return { url: 'https://via.placeholder.com/150' }; // Assuming no media endpoint yet
  },
  getStadiums: async () => {
    const res = await apiClient.get('/Captain/Stadiums');
    return res.data;
  },
  getStadiumDetails: async (stadiumId) => {
    const res = await apiClient.get(`/Captain/Stadiums/${stadiumId}`);
    return res.data;
  },
  getPitchCalendar: async (pitchId, date) => {
    const res = await apiClient.get(`/Captain/Pitches/${pitchId}/Calendar?date=${date}`);
    return res.data;
  },
  bookPitch: async (bookingData) => {
    const res = await apiClient.post('/Captain/BookPitch', bookingData);
    return res.data;
  },
  
  // --- MATCH REQUESTS ---
  requestToJoinMatch: async (id, data) => {
    const res = await apiClient.post(`/Captain/Matches/${id}/Request`, data);
    return res.data;
  },
  getMatchRequests: async () => {
    const res = await apiClient.get('/Captain/MatchRequests');
    return res.data;
  },
  acceptMatchRequest: async (id) => {
    const res = await apiClient.post(`/Captain/MatchRequests/${id}/Accept`);
    return res.data;
  },
  rejectMatchRequest: async (id) => {
    const res = await apiClient.post(`/Captain/MatchRequests/${id}/Reject`);
    return res.data;
  },

  // --- TOURNAMENTS ---
  registerTournament: async (id, data) => {
    const res = await apiClient.post(`/Captain/Tournaments/${id}/Register`, data);
    return res.data;
  },
  createTournament: async (tournamentData) => {
    const res = await apiClient.post('/Captain/CreateTournament', tournamentData);
    return res.data;
  },
  getTournaments: async () => {
    const res = await apiClient.get('/Captain/Tournaments');
    return res.data;
  },
  getTournamentSettings: async (id) => {
    const res = await apiClient.get(`/Captain/TournamentSettings/${id}`);
    return res.data;
  },
  updateTournamentSettings: async (id, data) => {
    const res = await apiClient.put(`/Captain/TournamentSettings/${id}`, data);
    return res.data;
  },
  getTournamentTeams: async (id) => {
    const res = await apiClient.get(`/Captain/Tournaments/${id}/Teams`);
    return res.data;
  },
  acceptTournamentTeam: async (tournamentId, teamId) => {
    const res = await apiClient.post(`/Captain/Tournaments/${tournamentId}/AcceptTeam/${teamId}`);
    return res.data;
  },
  rejectTournamentTeam: async (tournamentId, teamId) => {
    const res = await apiClient.post(`/Captain/Tournaments/${tournamentId}/RejectTeam/${teamId}`);
    return res.data;
  },
  addTeamToTournament: async (id, teamData) => {
    const res = await apiClient.post(`/Captain/Tournaments/${id}/AddTeam`, teamData);
    return res.data;
  },
  generateInternalTeams: async (id, numberOfTeams) => {
    // Requires a backend endpoint to generate teams. We'll do a simple loop here
    for(let i = 0; i < numberOfTeams; i++) {
        await apiClient.post(`/Captain/Tournaments/${id}/AddTeam`, {
            name: `Đội nội bộ ${i+1}`,
            abbr: `INT${i+1}`
        });
    }
    return { success: true };
  },
  getTournamentBracket: async (id) => {
    const res = await apiClient.get(`/Captain/Tournaments/${id}/Bracket`);
    return res.data;
  },
  updateSwissMatches: async (id, roundNum, matches) => {
    const res = await apiClient.put(`/Captain/Tournaments/${id}/SwissMatches`, { roundNum, matches });
    return res.data;
  },
  updateTournamentMatch: async (matchId, data) => {
    const res = await apiClient.put(`/Captain/Tournaments/Match/${matchId}`, data);
    return res.data;
  },
  getTournamentMatches: async (id) => {
    const res = await apiClient.get(`/Captain/Tournaments/${id}/Matches`);
    return res.data;
  }
};
