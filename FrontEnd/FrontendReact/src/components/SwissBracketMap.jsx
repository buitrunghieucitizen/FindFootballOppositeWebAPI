import React, { useState } from 'react';
import { FiHexagon, FiX, FiCheck } from 'react-icons/fi';

// Dummy data structure for a 16-team swiss format
export const DEFAULT_SWISS_16 = {
  rounds: [
    {
      round: 1,
      pools: [
        { record: '0-0', label: 'BEST OF 1', matches: [
          { id: 101, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 102, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 103, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 104, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 105, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 106, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 107, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 108, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 2,
      pools: [
        { record: '1-0', label: 'BEST OF 1', matches: [
          { id: 201, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 202, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 203, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 204, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]},
        { record: '0-1', label: 'BEST OF 1', matches: [
          { id: 205, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 206, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 207, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 208, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 3,
      pools: [
        { record: '2-0', label: 'BEST OF 3', matches: [
          { id: 301, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 302, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ], highlight: '1ST, 2ND' },
        { record: '1-1', label: 'BEST OF 1', matches: [
          { id: 303, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 304, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 305, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 306, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]},
        { record: '0-2', label: 'BEST OF 3', matches: [
          { id: 307, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 308, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 4,
      pools: [
        { record: '2-1', label: 'BEST OF 3', matches: [
          { id: 401, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 402, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 403, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ], highlight: '3RD, 4TH, 5TH' },
        { record: '1-2', label: 'BEST OF 3', matches: [
          { id: 404, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 405, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 406, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 5,
      pools: [
        { record: '2-2', label: 'BEST OF 3', matches: [
          { id: 501, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 502, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 503, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ], highlight: '6TH, 7TH, 8TH' }
      ]
    }
  ]
};

// Dummy data structure for an 8-team swiss format
export const DEFAULT_SWISS_8 = {
  rounds: [
    {
      round: 1,
      pools: [
        { record: '0-0', label: 'BEST OF 1', matches: [
          { id: 101, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 102, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 103, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 104, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 2,
      pools: [
        { record: '1-0', label: 'BEST OF 1', matches: [
          { id: 201, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 202, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]},
        { record: '0-1', label: 'BEST OF 1', matches: [
          { id: 203, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 204, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    },
    {
      round: 3,
      pools: [
        { record: '2-0', label: 'BEST OF 3', matches: [
          { id: 301, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ], highlight: '1ST' },
        { record: '1-1', label: 'BEST OF 1', matches: [
          { id: 302, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
          { id: 303, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]},
        { record: '0-2', label: 'BEST OF 3', matches: [
          { id: 304, home: 'Unknown', away: 'Unknown', homeScore: null, awayScore: null },
        ]}
      ]
    }
  ]
};

export default function SwissBracketMap({ data = DEFAULT_SWISS_16, onMatchUpdate }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // Tạm sử dụng state nội bộ
  const [bracketData, setBracketData] = useState(data);

  // Cập nhật bracketData khi data prop thay đổi (ví dụ khi reset giải đấu)
  React.useEffect(() => {
    setBracketData(data);
  }, [data]);

  const handleMatchClick = (match, roundIndex, poolIndex, matchIndex) => {
    setSelectedMatch({ ...match, roundIndex, poolIndex, matchIndex });
  };

  const handleSaveScore = (e) => {
    e.preventDefault();
    const newBracket = { ...bracketData };
    newBracket.rounds[selectedMatch.roundIndex].pools[selectedMatch.poolIndex].matches[selectedMatch.matchIndex] = {
      ...selectedMatch
    };
    setBracketData(newBracket);
    if(onMatchUpdate) onMatchUpdate(newBracket);
    setSelectedMatch(null);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl overflow-x-auto relative border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <FiHexagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Hệ Thụy Sĩ (Swiss)</h3>
            <p className="text-xs text-slate-400 font-medium">{bracketData.rounds.length} vòng · {bracketData.rounds[0]?.pools[0]?.matches.length * 2 || 0} đội</p>
          </div>
        </div>
      </div>

      {/* Bracket Grid */}
      <div className="relative z-10 flex gap-6 lg:gap-10 min-w-[1000px] py-4 justify-center items-center">
        
        {bracketData.rounds.map((round, rIndex) => (
          <div key={round.round} className="flex flex-col gap-5 justify-center items-center flex-shrink-0" style={{ width: '180px' }}>
            {/* Round Label */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 shadow-sm">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vòng {round.round}</span>
            </div>

            {round.pools.map((pool, pIndex) => (
              <div key={pool.record} className="relative w-full">
                {/* Highlight Label (1ST, 2ND...) */}
                {pool.highlight && (
                  <div className="absolute -right-2 -top-2 translate-x-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-black text-[10px] px-2.5 py-1 rounded-lg z-20 whitespace-nowrap shadow-md shadow-amber-500/20">
                    🏆 {pool.highlight}
                  </div>
                )}
                
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                  {/* Pool Header */}
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black text-center py-1.5 text-xs tracking-widest">
                    {pool.record}
                  </div>
                  
                  {/* Match List */}
                  <div className="p-1.5 space-y-1">
                    {pool.matches.map((match, mIndex) => {
                      const isPlayed = match.homeScore !== null && match.awayScore !== null;
                      const homeWon = isPlayed && match.homeScore > match.awayScore;
                      const awayWon = isPlayed && match.awayScore > match.homeScore;
                      return (
                        <div 
                          key={match.id} 
                          onClick={() => handleMatchClick(match, rIndex, pIndex, mIndex)}
                          className={`rounded-lg cursor-pointer transition-all p-1.5 ${isPlayed ? 'bg-teal-50 dark:bg-teal-900/15 border border-teal-200 dark:border-teal-800/40' : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 border border-transparent hover:border-teal-200/50'}`}
                        >
                          {/* Home row */}
                          <div className={`flex items-center justify-between gap-1 text-[11px] font-bold leading-tight ${homeWon ? 'text-teal-700 dark:text-teal-400' : isPlayed && awayWon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${homeWon ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              <span className="truncate">{match.home}</span>
                            </div>
                            <span className={`font-mono font-black text-xs min-w-[14px] text-right flex-shrink-0 ${isPlayed ? (homeWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400') : 'text-slate-300 dark:text-slate-600 text-[9px]'}`}>
                              {isPlayed ? match.homeScore : ''}
                            </span>
                          </div>
                          {/* Away row */}
                          <div className={`flex items-center justify-between gap-1 text-[11px] font-bold leading-tight mt-0.5 ${awayWon ? 'text-teal-700 dark:text-teal-400' : isPlayed && homeWon ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${awayWon ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              <span className="truncate">{match.away}</span>
                            </div>
                            <span className={`font-mono font-black text-xs min-w-[14px] text-right flex-shrink-0 ${isPlayed ? (awayWon ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400') : 'text-slate-300 dark:text-slate-600 text-[9px]'}`}>
                              {isPlayed ? match.awayScore : 'vs'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Best Of Label */}
                  <div className="text-center text-teal-600 dark:text-teal-400 font-bold text-[10px] py-1 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 uppercase tracking-wider">
                    {pool.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MATCH SCORE MODAL */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
            <button 
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 mt-1">Cập nhật tỉ số</h3>
            <p className="text-xs text-slate-400 mb-6">Hệ Thụy Sĩ · Vòng {selectedMatch.roundIndex + 1}</p>

            <form onSubmit={handleSaveScore}>
              <div className="flex items-center justify-between gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex-1 text-center">
                  <input 
                    type="text"
                    className="w-full bg-transparent text-center font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 outline-none"
                    value={selectedMatch.home}
                    onChange={e => setSelectedMatch({...selectedMatch, home: e.target.value})}
                    placeholder="Tên đội nhà"
                  />
                  <input 
                    type="number"
                    required
                    className="w-20 text-center text-4xl font-black border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white py-3"
                    value={selectedMatch.homeScore ?? ''}
                    onChange={e => setSelectedMatch({...selectedMatch, homeScore: e.target.value === '' ? null : Number(e.target.value)})}
                    placeholder="-"
                  />
                </div>
                
                <div className="font-bold text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-sm">VS</div>
                
                <div className="flex-1 text-center">
                  <input 
                    type="text"
                    className="w-full bg-transparent text-center font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 outline-none"
                    value={selectedMatch.away}
                    onChange={e => setSelectedMatch({...selectedMatch, away: e.target.value})}
                    placeholder="Tên đội khách"
                  />
                  <input 
                    type="number"
                    required
                    className="w-20 text-center text-4xl font-black border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white py-3"
                    value={selectedMatch.awayScore ?? ''}
                    onChange={e => setSelectedMatch({...selectedMatch, awayScore: e.target.value === '' ? null : Number(e.target.value)})}
                    placeholder="-"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2"
                >
                  <FiCheck /> Lưu Kết Quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
