import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function ScoreModal({ isOpen, onClose, match, onSubmit, isSetFormat, homeName, awayName }) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  
  // Set scores state: array of objects { home: '', away: '' }
  const [sets, setSets] = useState([
    { home: '', away: '' },
    { home: '', away: '' },
    { home: '', away: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      setHomeScore(match?.homeScore || 0);
      setAwayScore(match?.awayScore || 0);
      
      // Parse existing set scores if available
      if (match?.setScores) {
        const parsedSets = match.setScores.split(',').map(s => {
          const parts = s.trim().split('-');
          return { home: parts[0] || '', away: parts[1] || '' };
        });
        if (parsedSets.length > 0) {
          setSets(parsedSets);
        } else {
          setSets([ { home: '', away: '' }, { home: '', away: '' }, { home: '', away: '' } ]);
        }
      } else {
        setSets([ { home: '', away: '' }, { home: '', away: '' }, { home: '', away: '' } ]);
      }
    }
  }, [isOpen, match]);

  // Auto-calculate match score whenever sets change
  useEffect(() => {
    if (isSetFormat) {
      let homeWins = 0;
      let awayWins = 0;
      sets.forEach(s => {
        const h = parseInt(s.home);
        const a = parseInt(s.away);
        if (!isNaN(h) && !isNaN(a)) {
          if (h > a) homeWins++;
          else if (a > h) awayWins++;
        }
      });
      setHomeScore(homeWins);
      setAwayScore(awayWins);
    }
  }, [sets, isSetFormat]);

  if (!isOpen) return null;

  const handleSetChange = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const addSet = () => {
    setSets([...sets, { home: '', away: '' }]);
  };

  const removeSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
  };

  const handleSubmit = () => {
    let setScoresStr = null;
    if (isSetFormat) {
      const validSets = sets.filter(s => s.home !== '' && s.away !== '');
      if (validSets.length > 0) {
        setScoresStr = validSets.map(s => `${s.home}-${s.away}`).join(', ');
      }
    }
    onSubmit({ homeScore, awayScore, setScores: setScoresStr });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nhập Tỉ Số</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm transition-colors"><FiX size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Score (Auto-calculated for Set Format) */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 truncate" title={homeName}>{homeName || 'Đội Nhà'}</label>
              <input 
                type="number" 
                min="0" 
                value={homeScore} 
                onChange={e => !isSetFormat && setHomeScore(parseInt(e.target.value) || 0)} 
                readOnly={isSetFormat}
                className={`w-24 mx-auto text-center text-3xl font-black py-4 rounded-xl border ${isSetFormat ? 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'} outline-none`} 
              />
            </div>
            <div className="text-2xl font-bold text-slate-400 mt-6">-</div>
            <div className="flex-1 text-center">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 truncate" title={awayName}>{awayName || 'Đội Khách'}</label>
              <input 
                type="number" 
                min="0" 
                value={awayScore} 
                onChange={e => !isSetFormat && setAwayScore(parseInt(e.target.value) || 0)} 
                readOnly={isSetFormat}
                className={`w-24 mx-auto text-center text-3xl font-black py-4 rounded-xl border ${isSetFormat ? 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'} outline-none`} 
              />
            </div>
          </div>

          {isSetFormat && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tỉ số các Set</h4>
                <button onClick={addSet} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-200 flex items-center gap-1 transition-colors">
                  <FiPlus /> Thêm Set
                </button>
              </div>
              
              <div className="space-y-3">
                {sets.map((s, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-12">Set {index + 1}</span>
                    <input 
                      type="number" 
                      min="0"
                      value={s.home}
                      onChange={e => handleSetChange(index, 'home', e.target.value)}
                      className="w-16 text-center text-lg font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input 
                      type="number" 
                      min="0"
                      value={s.away}
                      onChange={e => handleSetChange(index, 'away', e.target.value)}
                      className="w-16 text-center text-lg font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {sets.length > 1 && (
                      <button onClick={() => removeSet(index)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors ml-auto">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-4 italic text-center">* Tỉ số trận đấu (bên trên) được tự động tính dựa trên số Set thắng.</p>
            </div>
          )}
        </div>
        
        <div className="p-5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={handleSubmit} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5">
            Lưu Tỉ Số
          </button>
        </div>
      </div>
    </div>
  );
}
