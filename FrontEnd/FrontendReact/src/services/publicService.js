import apiClient from './apiClient';

export const publicService = {
  getTeams: async () => {
    const res = await apiClient.get('/Public/Teams');
    return res.data.map(t => ({
      id: t.teamId,
      teamId: t.teamId,
      name: t.teamName,
      teamName: t.teamName,
      captainId: t.captainId,
      qualityLevel: t.qualityLevel,
      homeArea: t.homeArea,
      history: t.history,
      createdAt: t.createdAt,
      sportName: t.sportName
    }));
  },
  getStadiums: async () => {
    const res = await apiClient.get('/Public/Stadiums');
    return res.data;
  },
  getMatches: async () => {
    const res = await apiClient.get('/Public/Matches');
    return res.data;
  },
  getTournaments: async () => {
    const res = await apiClient.get('/Public/Tournaments');
    return res.data.map(t => ({
      id: t.tournamentId,
      name: t.tournamentName,
      format: t.format,
      status: t.status,
      startDate: t.startDate,
      endDate: t.endDate,
      description: t.description,
      createdAt: t.createdAt,
      stadiumName: t.stadiumName
    }));
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
  }
};
