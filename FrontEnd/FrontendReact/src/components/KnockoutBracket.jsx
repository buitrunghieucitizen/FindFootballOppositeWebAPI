import React, { useState, useEffect } from 'react';

export default function KnockoutBracket({ data, onMatchUpdate, numTeams = 8, teams = [], readOnly = false, tournamentId, service }) {
  // data.rounds array of { matches: [...] }
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [dbMatches, setDbMatches] = useState([]);

  useEffect(() => {
    if (tournamentId && service) {
      service.getTournamentMatches(tournamentId)
        .then(res => setDbMatches(res || []))
        .catch(err => console.warn("Lỗi tải trận đấu", err));
    }
  }, [tournamentId, service, data]);

  const openEdit = (match, roundIndex, matchIndex) => {
    if (readOnly) return;
    setEditingMatch({ match, roundIndex, matchIndex });
    setHomeScore(match.homeScore !== null ? match.homeScore : '');
    setAwayScore(match.awayScore !== null ? match.awayScore : '');
    setHomeTeamId(match.homeTeamId || '');
    setAwayTeamId(match.awayTeamId || '');
  };

  const handleSave = async () => {
    if (!editingMatch) return;
    const { roundIndex, matchIndex } = editingMatch;
    
    const newBracket = { ...data };
    const hScore = homeScore === '' ? null : Number(homeScore);
    const aScore = awayScore === '' ? null : Number(awayScore);

    newBracket.rounds[roundIndex].matches[matchIndex].homeScore = hScore;
    newBracket.rounds[roundIndex].matches[matchIndex].awayScore = aScore;
    newBracket.rounds[roundIndex].matches[matchIndex].homeTeamId = homeTeamId ? Number(homeTeamId) : null;
    newBracket.rounds[roundIndex].matches[matchIndex].awayTeamId = awayTeamId ? Number(awayTeamId) : null;
    
    // Tìm tên đội từ list
    const hTeam = teams.find(t => t.id === Number(homeTeamId));
    const aTeam = teams.find(t => t.id === Number(awayTeamId));
    newBracket.rounds[roundIndex].matches[matchIndex].home = hTeam ? hTeam.name : 'Unknown';
    newBracket.rounds[roundIndex].matches[matchIndex].away = aTeam ? aTeam.name : 'Unknown';

    // Tự động đẩy đội thắng lên vòng trong (nếu có vòng tiếp theo)
    if (hScore !== null && aScore !== null && roundIndex + 1 < newBracket.rounds.length) {
      const nextRoundIndex = roundIndex + 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const isHomeSlot = matchIndex % 2 === 0;

      let winningTeamId = null;
      let winningTeamName = 'Unknown';

      if (hScore > aScore) {
        winningTeamId = newBracket.rounds[roundIndex].matches[matchIndex].homeTeamId;
        winningTeamName = newBracket.rounds[roundIndex].matches[matchIndex].home;
      } else if (aScore > hScore) {
        winningTeamId = newBracket.rounds[roundIndex].matches[matchIndex].awayTeamId;
        winningTeamName = newBracket.rounds[roundIndex].matches[matchIndex].away;
      }

      if (winningTeamId) {
        if (isHomeSlot) {
          newBracket.rounds[nextRoundIndex].matches[nextMatchIndex].homeTeamId = winningTeamId;
          newBracket.rounds[nextRoundIndex].matches[nextMatchIndex].home = winningTeamName;
        } else {
          newBracket.rounds[nextRoundIndex].matches[nextMatchIndex].awayTeamId = winningTeamId;
          newBracket.rounds[nextRoundIndex].matches[nextMatchIndex].away = winningTeamName;
        }
      }
      
      if (tournamentId && service) {
        const hTeamIdNum = Number(homeTeamId);
        const aTeamIdNum = Number(awayTeamId);
        const dbMatch = dbMatches.find(m => m.homeTeamId === hTeamIdNum && m.awayTeamId === aTeamIdNum);
        if (dbMatch) {
          try {
            await service.submitTournamentMatchResult(dbMatch.matchId, hScore, aScore);
            alert('Đã cập nhật kết quả và cộng điểm thành công!');
          } catch (e) {
            console.warn("Lỗi cập nhật trận đấu", e);
          }
        }
      }
    }

    if (onMatchUpdate) {
      onMatchUpdate(newBracket);
    }
    setEditingMatch(null);
  };

  const MatchBox = ({ match, roundIndex, matchIndex }) => {
    const isPlayed = match.homeScore !== null && match.awayScore !== null;
    let homeWon = isPlayed && match.homeScore > match.awayScore;
    let awayWon = isPlayed && match.awayScore > match.homeScore;

    return (
      <div 
        onClick={() => openEdit(match, roundIndex, matchIndex)}
        className={`w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden text-sm relative z-10 ${readOnly ? '' : 'cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all'}`}
      >
        <div className="flex flex-col">
          <div className={`flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-700 ${homeWon ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
            <span className={`font-bold truncate ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {match.home}
            </span>
            <span className={`font-mono font-bold ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {match.homeScore ?? '-'}
            </span>
          </div>
          <div className={`flex justify-between items-center p-2 ${awayWon ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
            <span className={`font-bold truncate ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {match.away}
            </span>
            <span className={`font-mono font-bold ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {match.awayScore ?? '-'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRounds = () => {
    if (!data?.rounds || data.rounds.length === 0) return null;
    const containerMinHeight = Math.max(600, data.rounds[0].matches.length * 100);
    return (
      <div className="flex overflow-x-auto pb-8 pt-8 px-4 w-full" style={{ minHeight: containerMinHeight }}>
      {data.rounds && data.rounds.map((round, rIndex) => (
        <div key={rIndex} className="flex flex-col flex-1 min-w-[260px] relative">
          <div className="absolute -top-6 left-0 right-0 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {rIndex === data.rounds.length - 1 ? 'Chung Kết' : 
             (rIndex === 0 ? 'Vòng 1' : 
             (rIndex === data.rounds.length - 2 ? 'Bán Kết' : 
             `Vòng ${rIndex + 1}`))}
          </div>
          {round.matches.map((match, mIndex) => {
            const isTop = mIndex % 2 === 0;
            const hasNextRound = rIndex < data.rounds.length - 1;
            const hasPrevRound = rIndex > 0;
            
            return (
              <div key={mIndex} className="flex-1 flex flex-col justify-center relative py-4">
                
                {/* Dòng kẻ bên Trái */}
                {hasPrevRound && (
                   <div className="absolute border-b-2 border-slate-300 dark:border-slate-600" style={{ top: '50%', left: 0, width: 'calc(50% - 6rem)' }}></div>
                )}

                {/* MatchBox */}
                <div className="relative z-10 w-full flex justify-center">
                   <MatchBox match={match} roundIndex={rIndex} matchIndex={mIndex} />
                </div>

                {/* Dòng kẻ bên Phải */}
                {hasNextRound && (
                   <>
                     {/* Đường ngang */}
                     <div className="absolute border-b-2 border-slate-300 dark:border-slate-600" style={{ top: '50%', right: 0, width: 'calc(50% - 6rem)' }}></div>
                     
                     {/* Cột dọc */}
                     {isTop ? (
                       <div className="absolute right-0 border-r-2 border-slate-300 dark:border-slate-600" style={{ top: '50%', bottom: 0 }}></div>
                     ) : (
                       <div className="absolute right-0 border-r-2 border-slate-300 dark:border-slate-600" style={{ top: 0, bottom: '50%' }}></div>
                     )}
                   </>
                )}

              </div>
            );
          })}
        </div>
      ))}
    </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <h4 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-wider px-4 border-l-4 border-blue-500">Loại Trực Tiếp (Knockout Bracket)</h4>
        {renderRounds()}
      </div>

      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">Cập nhật kết quả trận đấu</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <select 
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- Chọn đội --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-20 text-center text-2xl font-bold border-b-2 border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  placeholder="-"
                />
              </div>
              <div className="text-center font-bold text-slate-400">VS</div>
              <div className="flex items-center gap-4">
                <select 
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- Chọn đội --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-20 text-center text-2xl font-bold border-b-2 border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
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

// Mẫu sơ đồ 8 Đội Loại Trực Tiếp
export const DEFAULT_KNOCKOUT_8 = {
  rounds: [
    { 
      matches: [
        { id: 'q1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q3', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q4', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    },
    { 
      matches: [
        { id: 's1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 's2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    },
    { 
      matches: [
        { id: 'f1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    }
  ]
};

export const DEFAULT_KNOCKOUT_16 = {
  rounds: [
    { 
      matches: [
        { id: 'r1_1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_3', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_4', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        { id: 'r1_5', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_6', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_7', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'r1_8', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    },
    { 
      matches: [
        { id: 'q1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q3', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 'q4', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    },
    { 
      matches: [
        { id: 's1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, 
        { id: 's2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    },
    { 
      matches: [
        { id: 'f1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }
      ] 
    }
  ]
};

export const generateKnockout = (teams, maxTeams = 8) => {
  if (!teams) return DEFAULT_KNOCKOUT_8;
  
  let size = maxTeams || 8;
  if (teams.length > size) {
    while (size < teams.length) size *= 2;
  }
  if (size < 4 && teams.length > 2) size = 4;
  
  const rounds = [];
  let currentMatches = size / 2;
  let roundIdx = 1;
  
  let firstRoundMatches = [];
  for (let i = 0; i < currentMatches; i++) {
    const t1 = teams[i * 2];
    const t2 = teams[i * 2 + 1];
    firstRoundMatches.push({
      id: `r1_${i + 1}`,
      home: t1 ? (t1.name || t1.teamName) : 'Unknown',
      away: t2 ? (t2.name || t2.teamName) : 'Unknown',
      homeTeamId: t1 ? (t1.id || t1.teamId) : null,
      awayTeamId: t2 ? (t2.id || t2.teamId) : null,
      homeScore: null,
      awayScore: null
    });
  }
  rounds.push({ matches: firstRoundMatches });
  
  currentMatches /= 2;
  roundIdx++;
  
  while (currentMatches >= 1) {
    let roundMatches = [];
    for (let i = 0; i < currentMatches; i++) {
      roundMatches.push({
        id: `r${roundIdx}_${i + 1}`,
        home: 'Unknown',
        away: 'Unknown',
        homeTeamId: null,
        awayTeamId: null,
        homeScore: null,
        awayScore: null
      });
    }
    rounds.push({ matches: roundMatches });
    currentMatches /= 2;
    roundIdx++;
  }
  
  return { rounds };
};
