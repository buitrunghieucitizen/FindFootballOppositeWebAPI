import apiClient from './apiClient';

export const captainService = {
  getMyTeam: async () => { const res = await apiClient.get('/Captain/MyTeam'); return res.data; },
  createTeam: async (teamData) => { const res = await apiClient.post('/Captain/CreateTeam', teamData); return res.data; },
  updateTeam: async (teamData) => { const res = await apiClient.put('/Captain/UpdateTeam', teamData); return res.data; },
  transferRole: async (transferData) => { const res = await apiClient.post('/Captain/TransferRole', transferData); return res.data; },
  getMembers: async () => { const res = await apiClient.get('/Captain/Members'); return res.data; },
  getJoinRequests: async () => { const res = await apiClient.get('/Captain/JoinRequests'); return res.data; },
  acceptMember: async (requestId) => { const res = await apiClient.post(`/Captain/AcceptMember/${requestId}`); return res.data; },
  rejectMember: async (requestId) => { const res = await apiClient.post(`/Captain/RejectMember/${requestId}`); return res.data; },
  kickMember: async (playerId) => { const res = await apiClient.post(`/Captain/RemoveMember/${playerId}`); return res.data; },
  getPosts: async () => { const res = await apiClient.get('/Captain/Posts'); return res.data; },
  createPost: async (postData) => { const res = await apiClient.post('/Captain/Posts', postData); return res.data; },
  getMatches: async () => { const res = await apiClient.get('/Captain/Matches'); return res.data; },
  getMatchAttendance: async (matchId) => { const res = await apiClient.get(`/Captain/Matches/${matchId}/Attendance`); return res.data; },
  markAsExternalPitch: async (id) => { const res = await apiClient.post(`/Captain/Matches/${id}/ExternalPitch`); return res.data; },
  updateScore: async (id, scoreData) => { const res = await apiClient.put(`/Captain/Matches/${id}/Score`, scoreData); return res.data; },
  confirmResult: async (id) => { const res = await apiClient.post(`/Captain/Matches/${id}/ConfirmResult`); return res.data; },
  cancelMatch: async (id, reason) => { const res = await apiClient.post(`/Captain/Matches/${id}/Cancel`, { reason }); return res.data; },
  createChallenge: async (data) => { const res = await apiClient.post('/Captain/CreateChallenge', data); return res.data; },
  updateChallenge: async (id, data) => { const res = await apiClient.put(`/Captain/Matches/${id}/Challenge`, data); return res.data; },
  getChallengeRequests: async () => { const res = await apiClient.get('/Captain/ChallengeRequests'); return res.data; },
  acceptChallenge: async (matchId) => { const res = await apiClient.post(`/Captain/AcceptChallenge/${matchId}`); return res.data; },
  rateOpponent: async (data) => { const res = await apiClient.post('/Captain/RateOpponent', data); return res.data; },
  rateOpponentPlayer: async (playerId, data) => { const res = await apiClient.post(`/Captain/RateOpponentPlayer/${playerId}`, data); return res.data; },
  getTeamRankings: async () => { const res = await apiClient.get('/Captain/TeamRankings'); return res.data; },
  getMatchChats: async (id) => { const res = await apiClient.get(`/Captain/Matches/${id}/Chats`); return res.data; },
  createTournament: async (tournamentData) => { const res = await apiClient.post('/Captain/CreateTournament', tournamentData); return res.data; },
  getTournaments: async () => { const res = await apiClient.get('/Captain/Tournaments'); return res.data; },
  getJoinedTournaments: async () => { const res = await apiClient.get('/Captain/JoinedTournaments'); return res.data; },
  getTournamentSettings: async (id) => { const res = await apiClient.get(`/Captain/TournamentSettings/${id}`); return res.data; },
  updateTournamentSettings: async (id, data) => { const res = await apiClient.put(`/Captain/TournamentSettings/${id}`, data); return res.data; },
  requestRefund: async (id) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/RequestRefund`); return res.data; },
  confirmRefund: async (id) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/ConfirmRefund`); return res.data; },
  getTournamentTeams: async (id) => { const res = await apiClient.get(`/Captain/Tournaments/${id}/Teams`); return res.data; },
  addTeamToTournament: async (id, teamData) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/AddTeam`, teamData); return res.data; },
  acceptTournamentTeam: async (tournamentId, teamId) => { const res = await apiClient.post(`/Captain/Tournaments/${tournamentId}/AcceptTeam/${teamId}`); return res.data; },
  rejectTournamentTeam: async (tournamentId, teamId) => { const res = await apiClient.post(`/Captain/Tournaments/${tournamentId}/RejectTeam/${teamId}`); return res.data; },
  registerTournament: async (id, data) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/Register`, data); return res.data; },
  generateInternalTeams: async (id, numberOfTeams) => {
    const membersRes = await captainService.getMembers();
    const members = Array.isArray(membersRes) ? membersRes : (membersRes?.members || []);
    const playerIds = members.filter(m => m.status === 'Active').map(m => m.playerId);
    if (playerIds.length === 0) throw new Error("Khong co thanh vien nao trong doi");
    const res = await apiClient.post(`/Captain/Tournaments/${id}/RandomizeTeams?numTeams=${numberOfTeams}`, playerIds);
    return res.data;
  },
  renameInternalTeam: async (id, teamId, newName) => {
    const res = await apiClient.put(`/Captain/Tournaments/${id}/Teams/${teamId}/Rename`, "\"" + newName + "\"", { headers: { 'Content-Type': 'application/json' } });
    return res.data;
  },
  getTournamentBracket: async (id) => { const res = await apiClient.get(`/Captain/Tournaments/${id}/Bracket`); return res.data; },
  updateTournamentBracket: async (id, data) => { const res = await apiClient.put(`/Captain/Tournaments/${id}/Bracket`, data); return res.data; },
  cancelTournament: async (id) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/Cancel`); return res.data; },
  submitTournamentMatchResult: async (matchId, homeScore, awayScore) => { const res = await apiClient.post(`/Captain/Tournaments/Match/${matchId}/SubmitResult`, { homeScore, awayScore }); return res.data; },
  updateTournamentMatch: async (matchId, data) => { const res = await apiClient.put(`/Captain/Tournaments/Match/${matchId}`, data); return res.data; },
  autoScheduleMatches: async (id) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/AutoSchedule`); return res.data; },
  startTournament: async (id) => { const res = await apiClient.post(`/Captain/Tournaments/${id}/Start`); return res.data; },
  getTournamentMatches: async (id) => { const res = await apiClient.get(`/Captain/Tournaments/${id}/Matches`); return res.data; },
  updateSwissMatches: async (id, roundNum, matches) => { const res = await apiClient.put(`/Captain/Tournaments/${id}/SwissMatches`, { roundNum, matches }); return res.data; },
  getStadiums: async () => { const res = await apiClient.get('/Captain/Stadiums'); return res.data; },
  getStadiumDetails: async (stadiumId) => { const res = await apiClient.get(`/Captain/Stadiums/${stadiumId}`); return res.data; },
  getPitchCalendar: async (pitchId, date) => { const res = await apiClient.get(`/Captain/Pitches/${pitchId}/Calendar?date=${date}`); return res.data; },
  bookPitch: async (bookingData) => { const res = await apiClient.post('/Captain/BookPitch', bookingData); return res.data; },
  createRecruitment: async (recruitmentData) => { const res = await apiClient.post('/Captain/CreateRecruitment', recruitmentData); return res.data; },
  requestToJoinMatch: async (id, data) => { const res = await apiClient.post(`/Captain/Matches/${id}/Request`, data); return res.data; },
  getMatchRequests: async () => { const res = await apiClient.get('/Captain/MatchRequests'); return res.data; },
  acceptMatchRequest: async (id) => { const res = await apiClient.post(`/Captain/MatchRequests/${id}/Accept`); return res.data; },
  rejectMatchRequest: async (id) => { const res = await apiClient.post(`/Captain/MatchRequests/${id}/Reject`); return res.data; },
  checkMatchRank: async (id) => { return { showWarning: false, requiresWarning: false, message: '' }; },
  uploadMedia: async (formData) => { return { url: 'https://placehold.co/150x150/emerald/white?text=Media' }; },
  createTournamentFeeLink: async (tournamentId) => { const res = await apiClient.post('/Payment/create-tournament-fee-link/' + tournamentId); return res.data; },
  getBookingHistory: async () => { const res = await apiClient.get('/Captain/BookingHistory'); return res.data; }
};
