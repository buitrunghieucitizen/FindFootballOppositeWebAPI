import React, { useState } from 'react';

export default function DoubleEliminationBracket({ data, onMatchUpdate, numTeams = 8 }) {
  // data.winners, data.losers, data.grandFinal
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [homeName, setHomeName] = useState('');
  const [awayName, setAwayName] = useState('');

  const openEdit = (match, bracketType, roundIndex, matchIndex) => {
    setEditingMatch({ match, bracketType, roundIndex, matchIndex });
    setHomeScore(match.homeScore !== null ? match.homeScore : '');
    setAwayScore(match.awayScore !== null ? match.awayScore : '');
    setHomeName(match.home);
    setAwayName(match.away);
  };

  const handleSave = () => {
    if (!editingMatch) return;
    const { bracketType, roundIndex, matchIndex } = editingMatch;
    
    const newBracket = { ...data };
    const hScore = homeScore === '' ? null : Number(homeScore);
    const aScore = awayScore === '' ? null : Number(awayScore);

    if (bracketType === 'grandFinal') {
      newBracket.grandFinal.matches[matchIndex].homeScore = hScore;
      newBracket.grandFinal.matches[matchIndex].awayScore = aScore;
      newBracket.grandFinal.matches[matchIndex].home = homeName;
      newBracket.grandFinal.matches[matchIndex].away = awayName;
    } else {
      newBracket[bracketType][roundIndex].matches[matchIndex].homeScore = hScore;
      newBracket[bracketType][roundIndex].matches[matchIndex].awayScore = aScore;
      newBracket[bracketType][roundIndex].matches[matchIndex].home = homeName;
      newBracket[bracketType][roundIndex].matches[matchIndex].away = awayName;
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
        className="w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden text-sm cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all relative z-10"
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
                Round {rIndex + 1}
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
                <input 
                  type="text"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
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
                <input 
                  type="text"
                  value={awayName}
                  onChange={(e) => setAwayName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
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
