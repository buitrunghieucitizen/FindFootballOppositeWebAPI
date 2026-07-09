import React, { useState } from 'react';
import { generateRoundRobin } from './LeagueMap';

export default function GroupStageMap({ data, onMatchUpdate, readOnly = false }) {
  // data.groups = [{ name: 'A', standings: [], matches: [] }, ...]
  
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'matches'
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const openEdit = (match, groupIndex, matchIndex) => {
    if (readOnly) return;
    setEditingMatch({ match, groupIndex, matchIndex });
    setHomeScore(match.homeScore !== null ? match.homeScore : '');
    setAwayScore(match.awayScore !== null ? match.awayScore : '');
  };

  const handleSave = () => {
    if (!editingMatch) return;
    const { groupIndex, matchIndex } = editingMatch;
    
    const newData = { ...data };
    newData.groups[groupIndex].matches[matchIndex].homeScore = homeScore === '' ? null : Number(homeScore);
    newData.groups[groupIndex].matches[matchIndex].awayScore = awayScore === '' ? null : Number(awayScore);

    // Recalculate standings for this group
    const group = newData.groups[groupIndex];
    // Reset standings
    group.standings.forEach(s => {
      s.played = 0; s.won = 0; s.drawn = 0; s.lost = 0; s.gd = 0; s.points = 0;
    });

    group.matches.forEach(m => {
      if (m.homeScore !== null && m.awayScore !== null) {
        const homeStand = group.standings.find(s => s.teamId === m.homeTeamId);
        const awayStand = group.standings.find(s => s.teamId === m.awayTeamId);
        
        if (homeStand && awayStand) {
          homeStand.played++;
          awayStand.played++;
          homeStand.gd += (m.homeScore - m.awayScore);
          awayStand.gd += (m.awayScore - m.homeScore);

          if (m.homeScore > m.awayScore) {
            homeStand.won++;
            homeStand.points += 3;
            awayStand.lost++;
          } else if (m.homeScore < m.awayScore) {
            awayStand.won++;
            awayStand.points += 3;
            homeStand.lost++;
          } else {
            homeStand.drawn++;
            awayStand.drawn++;
            homeStand.points += 1;
            awayStand.points += 1;
          }
        }
      }
    });

    // Sort standings
    group.standings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.won - a.won);

    onMatchUpdate(newData);
    setEditingMatch(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.groups?.map((group, gIndex) => (
          <div key={group.name} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="bg-teal-600 text-white p-4 font-black uppercase text-xl text-center tracking-widest">
              Bảng {group.name}
            </div>
            
            {activeTab === 'standings' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="p-3">#</th>
                      <th className="p-3">Đội bóng</th>
                      <th className="p-3 text-center" title="Số trận">Tr</th>
                      <th className="p-3 text-center" title="Thắng">T</th>
                      <th className="p-3 text-center" title="Hòa">H</th>
                      <th className="p-3 text-center" title="Thua">B</th>
                      <th className="p-3 text-center" title="Hiệu số">HS</th>
                      <th className="p-3 text-center text-teal-600 dark:text-teal-400 font-black">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.standings.map((team, idx) => (
                      <tr key={team.name} className={`border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${idx < 2 ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                        <td className="p-3 font-bold text-slate-400">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${idx === 0 ? 'bg-teal-600 text-white' : idx === 1 ? 'bg-emerald-500 text-white' : ''}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{team.name}</td>
                        <td className="p-3 text-center text-slate-500">{team.played}</td>
                        <td className="p-3 text-center text-emerald-500">{team.won}</td>
                        <td className="p-3 text-center text-amber-500">{team.drawn}</td>
                        <td className="p-3 text-center text-rose-500">{team.lost}</td>
                        <td className="p-3 text-center font-mono">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="p-3 text-center font-black text-teal-600 dark:text-teal-400 text-lg">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                {group.matches.map((match, mIndex) => {
                  const isPlayed = match.homeScore !== null && match.awayScore !== null;
                  return (
                    <div 
                      key={mIndex} 
                      onClick={() => openEdit(match, gIndex, mIndex)}
                      className={`flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${readOnly ? '' : 'cursor-pointer hover:border-teal-500 hover:shadow-sm transition-all'}`}
                    >
                      <div className={`flex-1 text-right font-bold truncate ${isPlayed && match.homeScore > match.awayScore ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {match.home}
                      </div>
                      <div className="mx-4 flex items-center gap-3">
                        <span className="font-mono text-xl font-black text-slate-900 dark:text-white">{match.homeScore ?? '-'}</span>
                        <span className="text-slate-400 font-bold text-sm bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">VS</span>
                        <span className="font-mono text-xl font-black text-slate-900 dark:text-white">{match.awayScore ?? '-'}</span>
                      </div>
                      <div className={`flex-1 text-left font-bold truncate ${isPlayed && match.awayScore > match.homeScore ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {match.away}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">Cập nhật kết quả bảng đấu</h3>
            
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="text-center flex-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 truncate" title={editingMatch.match.home}>{editingMatch.match.home}</div>
                <input 
                  type="number" 
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-full text-center text-3xl font-black border-b-2 border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-teal-500 text-slate-900 dark:text-white pb-1"
                  placeholder="-"
                />
              </div>
              <div className="font-bold text-slate-400 pt-8">VS</div>
              <div className="text-center flex-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 truncate" title={editingMatch.match.away}>{editingMatch.match.away}</div>
                <input 
                  type="number" 
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-full text-center text-3xl font-black border-b-2 border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-teal-500 text-slate-900 dark:text-white pb-1"
                  placeholder="-"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setEditingMatch(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/30"
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

export const generateGroupStage = (teams, maxTeams = 8) => {
  const actualMaxTeams = maxTeams || 8;
  const groupCount = Math.max(1, Math.ceil(actualMaxTeams / 4));
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  // Pad teams up to actualMaxTeams
  const paddedTeams = [...(teams || [])];
  while (paddedTeams.length < actualMaxTeams) {
    paddedTeams.push({ id: `unknown_${paddedTeams.length}`, name: `Chờ đội ${paddedTeams.length + 1}` });
  }

  const groups = [];
  
  for (let i = 0; i < groupCount; i++) {
    const groupTeams = paddedTeams.slice(i * Math.ceil(actualMaxTeams / groupCount), (i + 1) * Math.ceil(actualMaxTeams / groupCount));
    
    // Gen round robin for groupTeams
    const { rounds } = generateRoundRobin(groupTeams);
    const matches = rounds ? rounds.reduce((acc, r) => acc.concat(r.matches || []), []) : [];
    
    groups.push({
      name: groupNames[i] || `Group ${i+1}`,
      standings: groupTeams.map(t => ({
        teamId: t.id || t.teamId,
        name: t.name || t.teamName,
        played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0
      })),
      matches: matches.map(m => ({
        home: m.home,
        away: m.away,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeScore: null,
        awayScore: null
      }))
    });
  }
  return { groups };
};

// Mẫu Vòng Bảng 16 Đội chia 4 Bảng
export const DEFAULT_GROUP_STAGE = {
  groups: [
    {
      name: 'A',
      standings: [
        { name: 'Unknown 1', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 2', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 3', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 4', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
      ],
      matches: [
        { home: 'Unknown 1', away: 'Unknown 2', homeScore: null, awayScore: null },
        { home: 'Unknown 3', away: 'Unknown 4', homeScore: null, awayScore: null },
        { home: 'Unknown 1', away: 'Unknown 3', homeScore: null, awayScore: null },
        { home: 'Unknown 2', away: 'Unknown 4', homeScore: null, awayScore: null },
        { home: 'Unknown 4', away: 'Unknown 1', homeScore: null, awayScore: null },
        { home: 'Unknown 2', away: 'Unknown 3', homeScore: null, awayScore: null },
      ]
    },
    {
      name: 'B',
      standings: [
        { name: 'Unknown 5', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 6', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 7', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
        { name: 'Unknown 8', played: 0, won: 0, drawn: 0, lost: 0, gd: 0, points: 0 },
      ],
      matches: [
        { home: 'Unknown 5', away: 'Unknown 6', homeScore: null, awayScore: null },
        { home: 'Unknown 7', away: 'Unknown 8', homeScore: null, awayScore: null },
        { home: 'Unknown 5', away: 'Unknown 7', homeScore: null, awayScore: null },
        { home: 'Unknown 6', away: 'Unknown 8', homeScore: null, awayScore: null },
        { home: 'Unknown 8', away: 'Unknown 5', homeScore: null, awayScore: null },
        { home: 'Unknown 6', away: 'Unknown 7', homeScore: null, awayScore: null },
      ]
    }
  ]
};
