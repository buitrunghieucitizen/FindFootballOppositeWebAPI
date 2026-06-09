import React, { useState, useMemo } from 'react';

export default function LeagueMap({ data, onMatchUpdate }) {
  // data = { teams: [...], rounds: [{ round: 1, matches: [...] }, ...] }
  
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'matches'
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const openEdit = (match, roundIndex, matchIndex) => {
    setEditingMatch({ match, roundIndex, matchIndex });
    setHomeScore(match.homeScore !== null ? String(match.homeScore) : '');
    setAwayScore(match.awayScore !== null ? String(match.awayScore) : '');
  };

  const handleSave = () => {
    if (!editingMatch) return;
    const { roundIndex, matchIndex } = editingMatch;
    
    const newData = JSON.parse(JSON.stringify(data));
    newData.rounds[roundIndex].matches[matchIndex].homeScore = homeScore === '' ? null : Number(homeScore);
    newData.rounds[roundIndex].matches[matchIndex].awayScore = awayScore === '' ? null : Number(awayScore);

    onMatchUpdate(newData);
    setEditingMatch(null);
  };

  // Auto-calculate standings from match results
  const standings = useMemo(() => {
    if (!data?.teams) return [];
    const stats = {};
    data.teams.forEach(t => {
      stats[t] = { name: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    data.rounds?.forEach(round => {
      round.matches.forEach(m => {
        if (m.homeScore !== null && m.awayScore !== null) {
          const h = stats[m.home];
          const a = stats[m.away];
          if (!h || !a) return;
          h.played++; a.played++;
          h.gf += m.homeScore; h.ga += m.awayScore;
          a.gf += m.awayScore; a.ga += m.homeScore;
          h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
          if (m.homeScore > m.awayScore) {
            h.won++; h.points += 3; a.lost++;
          } else if (m.homeScore < m.awayScore) {
            a.won++; a.points += 3; h.lost++;
          } else {
            h.drawn++; h.points += 1; a.drawn++; a.points += 1;
          }
        }
      });
    });
    return Object.values(stats).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }, [data]);

  if (!data || !data.teams) return null;

  const totalMatches = data.rounds?.reduce((sum, r) => sum + r.matches.length, 0) || 0;
  const playedMatches = data.rounds?.reduce((sum, r) => sum + r.matches.filter(m => m.homeScore !== null && m.awayScore !== null).length, 0) || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-max mx-auto mb-6">
        <button 
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'standings' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Bảng Xếp Hạng
        </button>
        <button 
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'matches' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          Lịch Thi Đấu
        </button>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="font-black uppercase text-lg tracking-widest">ĐÁ VÒNG TRÒN (LEAGUE)</h3>
              <p className="text-teal-200 text-xs font-medium mt-0.5">{data.teams.length} đội · Round Robin · Tất cả gặp tất cả</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{playedMatches}/{totalMatches}</div>
            <div className="text-teal-200 text-xs font-bold">trận đã đấu</div>
          </div>
        </div>
        
        {activeTab === 'standings' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Đội bóng</th>
                  <th className="p-4 text-center" title="Số trận">Tr</th>
                  <th className="p-4 text-center" title="Thắng">T</th>
                  <th className="p-4 text-center" title="Hòa">H</th>
                  <th className="p-4 text-center" title="Thua">B</th>
                  <th className="p-4 text-center" title="Bàn thắng">BT</th>
                  <th className="p-4 text-center" title="Bàn thua">BB</th>
                  <th className="p-4 text-center" title="Hiệu số">HS</th>
                  <th className="p-4 text-center text-teal-600 dark:text-teal-400 font-black">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, idx) => (
                  <tr key={team.name} className={`border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${idx === 0 ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                    <td className="p-4 font-bold text-slate-400">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${idx === 0 ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30' : idx === 1 ? 'bg-blue-500 text-white' : idx === 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{team.name}</td>
                    <td className="p-4 text-center text-slate-500 font-medium">{team.played}</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">{team.won}</td>
                    <td className="p-4 text-center text-amber-500 font-bold">{team.drawn}</td>
                    <td className="p-4 text-center text-rose-500 font-bold">{team.lost}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-600 dark:text-slate-300">{team.gf}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-400">{team.ga}</td>
                    <td className={`p-4 text-center font-mono font-bold ${team.gd > 0 ? 'text-emerald-600' : team.gd < 0 ? 'text-rose-500' : 'text-slate-400'}`}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td className="p-4 text-center font-black text-teal-600 dark:text-teal-400 text-xl">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 space-y-8 bg-slate-50 dark:bg-slate-900/50 min-h-[400px]">
            {data.rounds?.map((round, rIndex) => {
              const roundPlayedCount = round.matches.filter(m => m.homeScore !== null && m.awayScore !== null).length;
              return (
                <div key={rIndex}>
                  {/* Round Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-600 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                      Vòng {round.round}
                    </div>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-bold text-slate-400">{roundPlayedCount}/{round.matches.length} trận</span>
                  </div>

                  {/* Match Cards */}
                  <div className="space-y-3">
                    {round.matches.map((match, mIndex) => {
                      const isPlayed = match.homeScore !== null && match.awayScore !== null;
                      const homeWon = isPlayed && match.homeScore > match.awayScore;
                      const awayWon = isPlayed && match.awayScore > match.homeScore;
                      const isDraw = isPlayed && match.homeScore === match.awayScore;
                      return (
                        <div 
                          key={mIndex}
                          onClick={() => openEdit(match, rIndex, mIndex)}
                          className={`bg-white dark:bg-slate-800 border p-4 rounded-xl flex items-center cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group/match relative overflow-hidden ${isPlayed ? 'border-teal-200 dark:border-teal-800/50' : 'border-slate-200 dark:border-slate-700'}`}
                        >
                          {isPlayed && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDraw ? 'bg-amber-400' : 'bg-teal-500'}`}></div>
                          )}
                          
                          {/* Home Team */}
                          <div className={`flex-1 text-right font-bold text-base truncate pr-4 ${homeWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {match.home}
                            {homeWon && <span className="ml-2 text-xs">✓</span>}
                          </div>

                          {/* Score Box */}
                          <div className={`flex items-center gap-3 px-5 py-2 rounded-xl border ${isPlayed ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50'}`}>
                            <span className={`font-mono text-2xl font-black ${homeWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{match.homeScore ?? '-'}</span>
                            <span className="text-slate-400 font-bold text-xs">VS</span>
                            <span className={`font-mono text-2xl font-black ${awayWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{match.awayScore ?? '-'}</span>
                          </div>

                          {/* Away Team */}
                          <div className={`flex-1 text-left font-bold text-base truncate pl-4 ${awayWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {awayWon && <span className="mr-2 text-xs">✓</span>}
                            {match.away}
                          </div>

                          {/* Status Indicator */}
                          <div className="ml-4 flex-shrink-0">
                            {isPlayed ? (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-md">Kết thúc</span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md group-hover/match:text-teal-500 group-hover/match:bg-teal-50 dark:group-hover/match:bg-teal-900/20 transition-colors">Chưa đấu</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 mt-2">Cập nhật kết quả</h3>
            <p className="text-xs text-slate-400 mb-6">Vòng {editingMatch.roundIndex + 1} · Trận {editingMatch.matchIndex + 1}</p>
            
            <div className="flex items-center justify-between gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="text-center flex-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-3 truncate text-sm" title={editingMatch.match.home}>{editingMatch.match.home}</div>
                <input 
                  type="number" 
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-20 text-center text-4xl font-black border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white py-3"
                  placeholder="-"
                />
              </div>
              <div className="font-bold text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-sm">VS</div>
              <div className="text-center flex-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-3 truncate text-sm" title={editingMatch.match.away}>{editingMatch.match.away}</div>
                <input 
                  type="number" 
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-20 text-center text-4xl font-black border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white py-3"
                  placeholder="-"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setEditingMatch(null)}
                className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30"
              >
                Lưu Kết Quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: generate full round-robin schedule (Circle Method) for N teams
function generateRoundRobin(teams) {
  const n = teams.length;
  const rounds = [];
  const list = [...teams];
  // If odd number of teams, add a BYE
  if (n % 2 !== 0) list.push(null);
  const numRounds = list.length - 1;
  const half = list.length / 2;

  for (let r = 0; r < numRounds; r++) {
    const matches = [];
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];
      if (home && away) {
        matches.push({ home, away, homeScore: null, awayScore: null });
      }
    }
    rounds.push({ round: r + 1, matches });
    // Rotate: keep first element fixed, rotate the rest
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

export const DEFAULT_LEAGUE = {
  teams: ['FC Siêu Sao', 'Hổ Trắng FC', 'Rồng Xanh FC', 'Phượng Hoàng', 'Sư Tử FC', 'Báo Đen FC'],
  rounds: generateRoundRobin(['FC Siêu Sao', 'Hổ Trắng FC', 'Rồng Xanh FC', 'Phượng Hoàng', 'Sư Tử FC', 'Báo Đen FC']),
};
