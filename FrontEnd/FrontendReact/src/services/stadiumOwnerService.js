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
  updateStadiumPaymentInfo: async (id, formData) => {
    const res = await apiClient.put(`/StadiumOwner/Stadiums/${id}/PaymentInfo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
  rejectBooking: async (id, reason) => {
    const res = await apiClient.post(`/StadiumOwner/Bookings/${id}/Reject`, { reason });
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
  getOwnerInvoices: async () => {
    try {
      const res = await apiClient.get('/StadiumOwner/Invoices');
      return res.data;
    } catch(err) {
      return [];
    }
  },
  payCommission: async () => {
    const res = await apiClient.post('/Payment/CreatePaymentLink', { Type: 'PayDebt' });
    return res.data;
  },
  getTournaments: async () => {
    return await apiClient.get('/StadiumOwner/Tournaments');
  },
  createTournament: async (data) => {
    return await apiClient.post('/StadiumOwner/CreateTournament', data);
  },
  uploadMedia: async (formData) => {
    return { url: 'https://placehold.co/150x150/indigo/white?text=Media' };
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
  acceptTournamentTeam: async (tournamentId, teamId) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${tournamentId}/AcceptTeam/${teamId}`);
    return res.data;
  },
  rejectTournamentTeam: async (tournamentId, teamId) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${tournamentId}/RejectTeam/${teamId}`);
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
  submitTournamentMatchResult: async (matchId, homeScore, awayScore) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/Match/${matchId}/SubmitResult`, { homeScore, awayScore });
    return res.data;
  },
  getTournamentMatches: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Matches`);
    return res.data;
  },
  getTournamentBracket: async (id) => {
    const res = await apiClient.get(`/StadiumOwner/Tournaments/${id}/Bracket`);
    return res.data;
  },
  updateTournamentBracket: async (id, data) => {
    const res = await apiClient.put(`/StadiumOwner/Tournaments/${id}/Bracket`, data);
    return res.data;
  },
  updateSwissMatches: async (id, roundNum, matches) => {
    const res = await apiClient.put(`/StadiumOwner/Tournaments/${id}/SwissMatches`, { roundNum, matches });
    return res.data;
  },
  createTournamentFeeLink: async (tournamentId) => {
    const res = await apiClient.post('/Payment/create-tournament-fee-link/' + tournamentId);
    return res.data;
  },
  cancelTournament: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/Cancel`);
    return res.data;
  },
  requestRefund: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/RequestRefund`);
    return res.data;
  },
  confirmRefund: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/Tournaments/${id}/ConfirmRefund`);
    return res.data;
  },
  
  createRecurringSchedule: async (pitchId, data) => {
    const res = await apiClient.post(`/StadiumOwner/Pitches/${pitchId}/RecurringSchedules`, data);
    return res.data;
  },
  
  // Recurring Bookings (from Captain)
  getRecurringBookings: async () => {
    const res = await apiClient.get('/StadiumOwner/RecurringBookings');
    return res.data;
  },
  acceptRecurringBooking: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/RecurringBookings/${id}/Accept`);
    return res.data;
  },
  rejectRecurringBooking: async (id) => {
    const res = await apiClient.post(`/StadiumOwner/RecurringBookings/${id}/Reject`);
    return res.data;
  }
};

export default stadiumOwnerService;



