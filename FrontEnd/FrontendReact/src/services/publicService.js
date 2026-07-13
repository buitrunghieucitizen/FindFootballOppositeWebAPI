import apiClient from './apiClient';

export const publicService = {
  getTeams: async (filters = {}) => {
    let url = '/Public/Teams';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.rankingTier) params.append('rankingTier', filters.rankingTier);
    if (filters.homeArea) params.append('homeArea', filters.homeArea);
    if (filters.minFairplay) params.append('minFairplay', filters.minFairplay);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    
    const queryString = params.toString();
    if (queryString) {
      url += '?' + queryString;
    }

    const res = await apiClient.get(url);
    const data = res.data;
    
    // Check if the response is paginated (has .teams) or not
    const teamsList = data.teams || data;
    
    const mappedTeams = teamsList.map(t => ({
      id: t.teamId,
      teamId: t.teamId,
      name: t.teamName,
      teamName: t.teamName,
      captainId: t.captainId,
      qualityLevel: t.qualityLevel,
      homeArea: t.homeArea,
      history: t.history,
      createdAt: t.createdAt,
      sportName: t.sportName,
      rankingScore: t.rankingScore,
      fairplayScore: t.fairplayScore
    }));

    if (data.teams) {
      return {
        teams: mappedTeams,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        page: data.page,
        pageSize: data.pageSize
      };
    }
    return mappedTeams;
  },
  getTeam: async (id) => {
    const res = await apiClient.get(`/Public/Teams/${id}`);
    return res.data;
  },
  getSports: async () => {
    const res = await apiClient.get('/Sports');
    return res.data;
  },
  getStadiums: async (filters = {}) => {
    let url = '/Public/Stadiums';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sportId) params.append('sportId', filters.sportId);
    if (params.toString()) url += '?' + params.toString();
    
    const res = await apiClient.get(url);
    return res.data;
  },
  getMatches: async (filters = {}) => {
    let url = '/Public/Matches';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sportId) params.append('sportId', filters.sportId);
    if (params.toString()) url += '?' + params.toString();
    
    const res = await apiClient.get(url);
    return res.data;
  },
  getIndividualMatches: async (filters = {}) => {
    let url = '/Public/IndividualMatches';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sportId) params.append('sportId', filters.sportId);
    if (params.toString()) url += '?' + params.toString();
    
    const res = await apiClient.get(url);
    return res.data;
  },
  getTournaments: async (filters = {}) => {
    let url = '/Public/Tournaments';
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.sportId) params.append('sportId', filters.sportId);
    if (params.toString()) url += '?' + params.toString();
    
    const res = await apiClient.get(url);
    return res.data.map(t => ({
      id: t.tournamentId,
      name: t.tournamentName,
      format: t.format,
      status: t.status,
      scope: t.scope,
      startDate: t.startDate,
      endDate: t.endDate,
      description: t.description,
      createdAt: t.createdAt,
      stadiumName: t.stadiumName,
      registeredTeamIds: t.registeredTeamIds || []
    }));
  },
  getTournamentTeams: async (id) => {
    const res = await apiClient.get(`/Public/Tournaments/${id}/Teams`);
    return res.data;
  },
  getTournamentMatches: async (id) => {
    const res = await apiClient.get(`/Public/Tournaments/${id}/Matches`);
    return res.data;
  },
  getTournamentBracket: async (id) => {
    const res = await apiClient.get(`/Public/Tournaments/${id}/Bracket`);
    return res.data;
  },
  getRecruitments: async () => {
    const res = await apiClient.get('/Public/Recruitments');
    return res.data;
  },
  getTeamRankings: async (sportId = 0) => {
    const url = sportId > 0 ? `/Public/TeamRankings?sportId=${sportId}` : '/Public/TeamRankings';
    const res = await apiClient.get(url);
    return res.data.map(t => ({
      id: t.teamId,
      name: t.teamName,
      rankingScore: t.rankingScore,
      homeArea: t.homeArea,
      sportName: t.sportName
    }));
  },
  getPosts: async () => {
    const res = await apiClient.get('/Public/Posts');
    return res.data;
  },
  submitFeedback: async (data) => {
    const res = await apiClient.post('/Public/Feedback', data);
    return res.data;
  }
};
