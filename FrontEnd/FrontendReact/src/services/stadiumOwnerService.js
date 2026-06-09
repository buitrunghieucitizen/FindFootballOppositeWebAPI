import apiClient from './apiClient';

const stadiumOwnerService = {
  getMyStadiums: async () => {
    const res = await apiClient.get('/StadiumOwner/MyStadiums');
    return res;
  },
  createStadium: async (data) => {
    const res = await apiClient.post('/StadiumOwner/Stadiums', data);
    return res;
  },
  createPitch: async (data) => {
    const res = await apiClient.post('/StadiumOwner/Pitches', data);
    return res;
  },
  getBookings: async () => {
    const res = await apiClient.get('/StadiumOwner/Bookings');
    return res;
  },
  confirmBooking: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/Bookings/${id}/Confirm`);
    return res;
  },
  rejectBooking: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/Bookings/${id}/Reject`);
    return res;
  },
  getOwnerRevenue: async (year = new Date().getFullYear()) => {
    try {
        const res = await apiClient.get(`/StadiumOwner/OwnerRevenue?year=${year}`);
        return res;
    } catch(err) {
        return { data: [] };
    }
  },
  getTournaments: async () => {
    return await apiClient.get('/StadiumOwner/Tournaments');
  },
  createTournament: async (data) => {
    return await apiClient.post('/StadiumOwner/CreateTournament', data);
  },
  getTournamentSettings: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/TournamentSettings/${id}`);
    return res.data;
  },
  updateTournamentSettings: async (id, data) => {
    return await apiClient.put(`/StadiumOwner/TournamentSettings/${id}`, data);
  },
  getTournamentTeams: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Teams`);
    return res.data;
  },
  getTournamentBracket: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Bracket`);
    return res.data;
  },
  generateInternalTeams: async (id, numTeams) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/GenerateInternal`, { numTeams });
    return res.data;
  },
  addTeamToTournament: async (id, data) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/AddTeam`, data);
    return res.data;
  },
  updateSwissMatches: async (id, roundNum, matches) => {
    const res = await apiClient.put(`/StadiumOwner/Tournaments/${id}/SwissMatches`, { roundNum, matches });
    return res.data;
  },
  getTournamentRegistrations: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Registrations`);
    return res.data;
  },
  approveRegistration: async (id, teamId) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/Approve/${teamId}`);
    return res.data;
  },
  rejectRegistration: async (id, teamId) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/Reject/${teamId}`);
    return res.data;
  },
  updateTournamentMatch: async (matchId, data) => {
    const res = await apiClient.put(`/StadiumOwner/Tournaments/Match/${matchId}`, data);
    return res.data;
  },
  getTournamentMatches: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Matches`);
    return res.data;
  },
  
  createRecurringSchedule: async (pitchId, data) => {
    const res = await apiClient.post(`/StadiumOwner/Pitches/${pitchId}/RecurringSchedules`, data);
    return res.data;
  }
};

export default stadiumOwnerService;
