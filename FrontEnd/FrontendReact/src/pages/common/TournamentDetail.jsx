import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { PublicHeader } from '../../components/portal-ui';
import { FiCalendar, FiUsers, FiDollarSign, FiInfo, FiEdit2, FiCheck, FiX, FiShield } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { captainService } from '../../services/captainService';

import KnockoutBracket, { DEFAULT_KNOCKOUT_8, DEFAULT_KNOCKOUT_16, generateKnockout } from '../../components/KnockoutBracket';
import GroupStageMap, { DEFAULT_GROUP_STAGE, generateGroupStage } from '../../components/GroupStageMap';
import DoubleEliminationBracket, { DEFAULT_DOUBLE_ELIM_8, generateDoubleElimination } from '../../components/DoubleEliminationBracket';
import LeagueMap, { DEFAULT_LEAGUE, generateRoundRobin } from '../../components/LeagueMap';
import SwissBracketMap, { DEFAULT_SWISS_8, DEFAULT_SWISS_16, generateSwissBracket } from '../../components/SwissBracketMap';

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [myTeam, setMyTeam] = useState(null);
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await publicService.getTournaments();
      const currentTournament = data.find(t => (t.id || t.tournamentId) === Number(id));
      
      if (currentTournament) {
        setTournament(currentTournament);
        const teamsData = await publicService.getTournamentTeams(id);
        setTeams(teamsData || []);
        
        if (user) {
          const userTeam = teamsData.find(t => t.captainId === user.userId || t.captainId === Number(user.nameid));
          if (userTeam) {
            setMyTeam(userTeam);
            setNewTeamName(userTeam.teamName);
          }
        }
        
        try {
          const matchData = await publicService.getTournamentMatches(id);
          setMatches(Array.isArray(matchData) ? matchData : []);
        } catch (e) {
          setMatches([]);
        }

        try {
          const bracketData = await publicService.getTournamentBracket(id);
          setBracket(bracketData || { rounds: [] });
        } catch (e) {
          setBracket({ rounds: [] });
        }
      } else {
        setError('Không tìm thấy giải đấu');
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu giải đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      await captainService.renameInternalTeam(id, myTeam.teamId, newTeamName);
      setMyTeam({ ...myTeam, teamName: newTeamName });
      setIsEditingTeamName(false);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-xl font-bold text-yellow-600 animate-pulse">Đang tải...</div></div>;
  if (error || !tournament) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-red-500 font-bold">{error}</div></div>;

  const mergeMatchesIntoBracket = (bracketData, dbMatches) => {
    if (!bracketData || !dbMatches || dbMatches.length === 0) return bracketData;
    const newBracket = JSON.parse(JSON.stringify(bracketData));
    
    const tryMatch = (m, roundIndex, bracketSection) => {
      if (!m) return;
      const dbM = dbMatches.find(db => 
        (db.homeTeamId === m.homeTeamId && db.awayTeamId === m.awayTeamId && m.homeTeamId) ||
        (db.homeTeamName === m.home && db.awayTeamName === m.away && m.home) ||
        (db.homeTeamName?.includes(m.home) && db.awayTeamName?.includes(m.away) && m.home) ||
        (db.homeTeamId === m.homeId && db.awayTeamId === m.awayId && m.homeId) ||
        (db.homeTeamName === m.homeName && db.awayTeamName === m.awayName && m.homeName) ||
        (m.t1?.name && db.homeTeamName === m.t1?.name && db.awayTeamName === m.t2?.name)
      );
      if (dbM) {
        if (dbM.homeScore !== null) m.homeScore = dbM.homeScore;
        if (dbM.awayScore !== null) m.awayScore = dbM.awayScore;
        if (m.t1 && m.t2) {
          if (dbM.homeScore !== null) m.t1.score = dbM.homeScore;
          if (dbM.awayScore !== null) m.t2.score = dbM.awayScore;
        }
      }
    };

    if (newBracket.rounds) {
      newBracket.rounds.forEach((r, roundIndex) => {
        r.matches && r.matches.forEach((m, matchIndex) => {
          tryMatch(m, roundIndex, newBracket.rounds);
          
          // Auto advance winner for standard Knockout
          if (m.homeScore !== null && m.awayScore !== null && roundIndex + 1 < newBracket.rounds.length) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const isHomeSlot = matchIndex % 2 === 0;
            
            let winningTeamId = null;
            let winningTeamName = 'Unknown';
            if (m.homeScore > m.awayScore) {
              winningTeamId = m.homeTeamId;
              winningTeamName = m.home;
            } else if (m.awayScore > m.homeScore) {
              winningTeamId = m.awayTeamId;
              winningTeamName = m.away;
            }

            if (winningTeamId && newBracket.rounds[nextRoundIndex] && newBracket.rounds[nextRoundIndex].matches[nextMatchIndex]) {
              const nextM = newBracket.rounds[nextRoundIndex].matches[nextMatchIndex];
              if (isHomeSlot) {
                nextM.homeTeamId = winningTeamId;
                nextM.home = winningTeamName;
              } else {
                nextM.awayTeamId = winningTeamId;
                nextM.away = winningTeamName;
              }
            }
          }
        });
      });
    }
    if (newBracket.groups) newBracket.groups.forEach(g => g.matches && g.matches.forEach(tryMatch));
    if (newBracket.winners) newBracket.winners.forEach(r => r.matches && r.matches.forEach(tryMatch));
    if (newBracket.losers) newBracket.losers.forEach(r => r.matches && r.matches.forEach(tryMatch));
    if (newBracket.grandFinal) newBracket.grandFinal.matches && newBracket.grandFinal.matches.forEach(tryMatch);
    return newBracket;
  };
  
  const displayBracket = mergeMatchesIntoBracket(bracket, matches);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      <PublicHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 animate-fade-in">
        <Link to="/tournaments" className="text-yellow-600 hover:text-yellow-700 font-semibold mb-6 inline-block">
          &larr; Quay lại danh sách giải đấu
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-yellow-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-yellow-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <FaTrophy className="text-5xl text-yellow-400" />
              </div>
              <div className="text-center md:text-left flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-3">
                  {tournament.format || 'League'}
                </span>
                <h1 className="text-3xl md:text-5xl font-black mb-2">{tournament.name || tournament.tournamentName}</h1>
                <p className="text-yellow-200 text-lg opacity-90">{tournament.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-6 inline-flex">
              <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Tổng Quan</button>
              <button onClick={() => setActiveTab('matches')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'matches' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Lịch Thi Đấu</button>
              <button onClick={() => setActiveTab('bracket')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'bracket' ? 'bg-white dark:bg-slate-700 text-yellow-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Sơ Đồ / Bảng Xếp Hạng</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                
                {activeTab === 'overview' && (
                  <>
                    <section>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Thông tin giải đấu</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400"><FiCalendar size={20} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái</p>
                            <p className="font-bold text-slate-800 dark:text-white">{tournament.status === 'Upcoming' ? 'Sắp diễn ra' : tournament.status === 'Ongoing' ? 'Đang đá' : 'Đã kết thúc'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400"><FiUsers size={20} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đội tham gia</p>
                            <p className="font-bold text-slate-800 dark:text-white">{teams.length} đội</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2"><FiInfo className="text-yellow-500" /> Danh sách đội tham gia ({teams.length})</h3>
                      {teams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {teams.map(t => (
                            <div key={t.teamId} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                {t.teamName.charAt(0)}
                              </div>
                              <div className="font-bold text-slate-800 dark:text-white">{t.teamName}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
                          <FaTrophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có thông tin đội bóng tham gia.</p>
                        </div>
                      )}
                    </section>
                  </>
                )}

                {activeTab === 'matches' && (
                  <section>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Lịch Thi Đấu</h3>
                    {!Array.isArray(matches) || matches.length === 0 ? (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 font-medium">Chưa có trận đấu nào được xếp lịch.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matches.map(m => (
                          <div key={m.matchId} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                            <div className="flex items-center flex-1 w-full md:w-auto">
                              <div className="flex-1 text-right font-bold text-slate-800 dark:text-white pr-4">{m.homeTeamName}</div>
                              <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-lg font-black text-emerald-600 dark:text-emerald-400">
                                {m.homeScore !== null ? m.homeScore : '-'} : {m.awayScore !== null ? m.awayScore : '-'}
                              </div>
                              <div className="flex-1 text-left font-bold text-slate-800 dark:text-white pl-4">{m.awayTeamName}</div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-right shrink-0">
                              <div>{m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : 'Chưa xếp ngày'}</div>
                              <div>{m.startTime || 'Chưa rõ giờ'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'bracket' && (
                  <section>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Sơ đồ / Bảng xếp hạng</h3>
                    <div className="overflow-x-auto pb-4">
                      {tournament.format?.toLowerCase() === 'knockout' ? (
                        <KnockoutBracket data={displayBracket?.rounds?.length > 0 ? displayBracket : generateKnockout([], tournament.maxTeams || 8)} teams={teams.map(t => ({id: t.teamId, name: t.teamName, ...t}))} readOnly={true} />
                      ) : tournament.format?.toLowerCase() === 'doubleelimination' ? (
                        <DoubleEliminationBracket data={displayBracket?.winners?.length > 0 ? displayBracket : generateDoubleElimination([], tournament.maxTeams || 8)} teams={teams.map(t => ({id: t.teamId, name: t.teamName, ...t}))} readOnly={true} />
                      ) : tournament.format?.toLowerCase() === 'groupstage' ? (
                        <GroupStageMap data={displayBracket?.groups?.length > 0 ? displayBracket : generateGroupStage([], tournament.maxTeams || 8)} teams={teams.map(t => ({id: t.teamId, name: t.teamName, ...t}))} readOnly={true} />
                      ) : tournament.format?.toLowerCase() === 'league' ? (
                        <LeagueMap data={displayBracket?.teams?.length > 0 ? displayBracket : generateRoundRobin([], tournament.maxTeams || 6)} teams={teams.map(t => ({id: t.teamId, name: t.teamName, ...t}))} readOnly={true} dbMatches={matches} />
                      ) : tournament.format?.toLowerCase() === 'swiss' ? (
                        <SwissBracketMap data={displayBracket?.rounds?.length > 0 ? displayBracket : generateSwissBracket([], tournament.maxTeams || 16)} readOnly={true} />
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
                          <p className="text-slate-500 font-medium">Chưa có sơ đồ thi đấu nào được tạo.</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Lệ phí giải</h4>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    Miễn phí
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Dành cho các đội bóng được mời tham gia.</p>
                  {tournament.scope !== 'Internal' ? (
                    <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                      Đăng Ký Tham Gia
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-center border border-slate-200">
                      Giải đấu nội bộ
                    </div>
                  )}
                </div>
                
                {myTeam && tournament.scope === 'Internal' && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      <FiShield /> Dashboard Đội Nội Bộ
                    </h4>
                    <div className="mb-4">
                      <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium mb-1">Đội của bạn:</p>
                      
                      {!isEditingTeamName ? (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
                          <span className="font-bold text-slate-800 dark:text-white">{myTeam.teamName}</span>
                          <button 
                            onClick={() => setIsEditingTeamName(true)}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Đổi tên đội"
                          >
                            <FiEdit2 />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-500 shadow-sm">
                          <input 
                            type="text" 
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold px-2 text-slate-800 dark:text-white"
                            autoFocus
                          />
                          <button onClick={handleRenameTeam} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><FiCheck /></button>
                          <button onClick={() => { setIsEditingTeamName(false); setNewTeamName(myTeam.teamName); }} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><FiX /></button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
