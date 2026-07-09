import React, { useState, useEffect } from 'react';

export default function DoubleEliminationBracket({ data, onMatchUpdate, numTeams = 8, teams = [], readOnly = false, tournamentId, service }) {
  // data.winners, data.losers, data.grandFinal
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

  const openEdit = (match, bracketType, roundIndex, matchIndex) => {
    if (readOnly) return;
    setEditingMatch({ match, bracketType, roundIndex, matchIndex });
    setHomeScore(match.homeScore !== null ? match.homeScore : '');
    setAwayScore(match.awayScore !== null ? match.awayScore : '');
    setHomeTeamId(match.homeTeamId || '');
    setAwayTeamId(match.awayTeamId || '');
  };

  const handleSave = async () => {
    if (!editingMatch) return;
    const { bracketType, roundIndex, matchIndex } = editingMatch;
    
    const newBracket = { ...data };
    const hScore = homeScore === '' ? null : Number(homeScore);
    const aScore = awayScore === '' ? null : Number(awayScore);

    const hTeamId = homeTeamId ? Number(homeTeamId) : null;
    const aTeamId = awayTeamId ? Number(awayTeamId) : null;
    const hTeam = teams.find(t => t.id === hTeamId);
    const aTeam = teams.find(t => t.id === aTeamId);
    const hName = hTeam ? hTeam.name : 'Unknown';
    const aName = aTeam ? aTeam.name : 'Unknown';

    if (bracketType === 'grandFinal') {
      newBracket.grandFinal.matches[matchIndex].homeScore = hScore;
      newBracket.grandFinal.matches[matchIndex].awayScore = aScore;
      newBracket.grandFinal.matches[matchIndex].homeTeamId = hTeamId;
      newBracket.grandFinal.matches[matchIndex].awayTeamId = aTeamId;
      newBracket.grandFinal.matches[matchIndex].home = hName;
      newBracket.grandFinal.matches[matchIndex].away = aName;
    } else {
      newBracket[bracketType][roundIndex].matches[matchIndex].homeScore = hScore;
      newBracket[bracketType][roundIndex].matches[matchIndex].awayScore = aScore;
      newBracket[bracketType][roundIndex].matches[matchIndex].homeTeamId = hTeamId;
      newBracket[bracketType][roundIndex].matches[matchIndex].awayTeamId = aTeamId;
      newBracket[bracketType][roundIndex].matches[matchIndex].home = hName;
      newBracket[bracketType][roundIndex].matches[matchIndex].away = aName;
    }

    // Auto advance logic
    if (hScore !== null && aScore !== null) {
      let winningTeamId = hScore > aScore ? hTeamId : (aScore > hScore ? aTeamId : null);
      let winningTeamName = hScore > aScore ? hName : (aScore > hScore ? aName : 'Unknown');

      if (winningTeamId) {
        if (bracketType === 'winners') {
          if (roundIndex + 1 < newBracket.winners.length) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const isHomeSlot = matchIndex % 2 === 0;
            
            if (isHomeSlot) {
              newBracket.winners[nextRoundIndex].matches[nextMatchIndex].homeTeamId = winningTeamId;
              newBracket.winners[nextRoundIndex].matches[nextMatchIndex].home = winningTeamName;
            } else {
              newBracket.winners[nextRoundIndex].matches[nextMatchIndex].awayTeamId = winningTeamId;
              newBracket.winners[nextRoundIndex].matches[nextMatchIndex].away = winningTeamName;
            }
          } else if (newBracket.grandFinal) {
            newBracket.grandFinal.matches[0].homeTeamId = winningTeamId;
            newBracket.grandFinal.matches[0].home = winningTeamName;
          }
        } else if (bracketType === 'losers') {
          if (roundIndex + 1 < newBracket.losers.length) {
            const nextRoundIndex = roundIndex + 1;
            const isHalvingRound = newBracket.losers[roundIndex].matches.length > newBracket.losers[nextRoundIndex].matches.length;
            const nextMatchIndex = isHalvingRound ? Math.floor(matchIndex / 2) : matchIndex;
            
            const targetMatch = newBracket.losers[nextRoundIndex].matches[nextMatchIndex];
            if (targetMatch) {
              if (isHalvingRound) {
                if (matchIndex % 2 === 0) {
                  targetMatch.homeTeamId = winningTeamId;
                  targetMatch.home = winningTeamName;
                } else {
                  targetMatch.awayTeamId = winningTeamId;
                  targetMatch.away = winningTeamName;
                }
              } else {
                targetMatch.homeTeamId = winningTeamId;
                targetMatch.home = winningTeamName;
              }
            }
          } else if (newBracket.grandFinal) {
            newBracket.grandFinal.matches[0].awayTeamId = winningTeamId;
            newBracket.grandFinal.matches[0].away = winningTeamName;
          }
        }
      }
      
      if (tournamentId && service) {
        const hTeamIdNum = Number(hTeamId);
        const aTeamIdNum = Number(aTeamId);
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

    onMatchUpdate(newBracket);
    setEditingMatch(null);
  };

  const MatchBox = ({ match, bracketType, roundIndex, matchIndex }) => {
    const isPlayed = match.homeScore !== null && match.awayScore !== null;
    let homeWon = isPlayed && match.homeScore > match.awayScore;
    let awayWon = isPlayed && match.awayScore > match.homeScore;

    return (
      <div 
        onClick={() => openEdit(match, bracketType, roundIndex, matchIndex)}
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

  const renderBracket = (bracketData, type, title) => {
    if (!bracketData || bracketData.length === 0) return null;
    return (
      <div className="mb-12">
        <h4 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-wider px-4 border-l-4 border-emerald-500">{title}</h4>
        <div className="flex gap-16 overflow-x-auto pb-8 pt-4 px-4 custom-scrollbar">
          {bracketData.map((round, rIndex) => (
            <div key={rIndex} className="flex flex-col justify-around relative min-w-[192px]">
              <div className="absolute -top-8 left-0 right-0 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Vòng {rIndex + 1}
              </div>
              {round.matches.map((match, mIndex) => (
                <div key={match.id} className="relative my-4 flex items-center justify-center">
                  <MatchBox match={match} bracketType={type} roundIndex={rIndex} matchIndex={mIndex} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {renderBracket(data.winners, 'winners', 'Nhánh Thắng (Winners Bracket)')}
        {renderBracket(data.losers, 'losers', 'Nhánh Thua (Losers Bracket)')}
        
        {data.grandFinal && (
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
            <h4 className="text-xl font-black text-amber-600 dark:text-amber-400 mb-6 uppercase tracking-wider px-4 border-l-4 border-amber-500">Chung Kết Tổng (Grand Final)</h4>
            <div className="flex gap-16 overflow-x-auto pb-4 px-4 custom-scrollbar">
              <div className="flex flex-col justify-around relative min-w-[192px]">
                {data.grandFinal.matches.map((match, mIndex) => (
                  <div key={match.id} className="relative my-4 flex items-center justify-center">
                    <MatchBox match={match} bracketType="grandFinal" roundIndex={0} matchIndex={mIndex} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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

// Mẫu sơ đồ 8 Đội Nhánh Thắng / Nhánh Thua
export const DEFAULT_DOUBLE_ELIM_8 = {
  winners: [
    { matches: [{ id: 'w1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'w2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'w3', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'w4', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] },
    { matches: [{ id: 'w5', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'w6', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] },
    { matches: [{ id: 'w7', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] }
  ],
  losers: [
    { matches: [{ id: 'l1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'l2', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] },
    { matches: [{ id: 'l3', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }, { id: 'l4', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] },
    { matches: [{ id: 'l5', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] },
    { matches: [{ id: 'l6', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }] }
  ],
  grandFinal: {
    matches: [{ id: 'gf1', home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null }]
  }
};

export const generateDoubleElimination = (teams, maxTeams = 8) => {
  if (!teams) return DEFAULT_DOUBLE_ELIM_8;
  
  let size = maxTeams || 8;
  if (teams.length > size) {
    while (size < teams.length) size *= 2;
  }
  if (size < 4 && teams.length > 2) size = 4;
  
  const winners = [];
  let wMatches = size / 2;
  let wRound = 1;
  let firstRoundMatches = [];
  for (let i = 0; i < wMatches; i++) {
    const t1 = teams[i * 2];
    const t2 = teams[i * 2 + 1];
    firstRoundMatches.push({
      id: `w1_${i + 1}`,
      home: t1 ? (t1.name || t1.teamName) : 'Unknown',
      away: t2 ? (t2.name || t2.teamName) : 'Unknown',
      homeTeamId: t1 ? (t1.id || t1.teamId) : null,
      awayTeamId: t2 ? (t2.id || t2.teamId) : null,
      homeScore: null,
      awayScore: null
    });
  }
  winners.push({ matches: firstRoundMatches });
  wMatches /= 2;
  wRound++;
  
  while (wMatches >= 1) {
    let roundMatches = [];
    for (let i = 0; i < wMatches; i++) {
      roundMatches.push({
        id: `w${wRound}_${i + 1}`,
        home: 'Unknown', away: 'Unknown',
        homeTeamId: null, awayTeamId: null,
        homeScore: null, awayScore: null
      });
    }
    winners.push({ matches: roundMatches });
    wMatches /= 2;
    wRound++;
  }
  
  const losers = [];
  let lMatches = size / 4; 
  let lRound = 1;
  
  while (lMatches >= 1) {
    let r1 = [];
    for (let i = 0; i < lMatches; i++) {
      r1.push({ id: `l${lRound}_${i+1}`, home: 'Unknown', away: 'Unknown', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null });
    }
    losers.push({ matches: r1 });
    lRound++;
    
    let r2 = [];
    for (let i = 0; i < lMatches; i++) {
      r2.push({ id: `l${lRound}_${i+1}`, home: 'Unknown', away: 'Unknown', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null });
    }
    losers.push({ matches: r2 });
    lRound++;
    
    lMatches /= 2;
  }
  
  // If size is 2, losers bracket doesn't really exist in this standard format, handle gracefully if size < 4.
  // But our while loop condition lMatches >= 1 will just not execute if size = 2 (size/4 = 0.5)
  
  return { 
    winners, 
    losers,
    grandFinal: { matches: [{ id: 'gf1', home: 'Unknown', away: 'Unknown', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null }] }
  };
};
