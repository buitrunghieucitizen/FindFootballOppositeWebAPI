import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';

export default function MatchHistoryTab() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await playerService.getMatches();
      setMatches(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách trận đấu.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (matchId, isAttending) => {
    try {
      await playerService.voteAttendance(matchId, isAttending);
      alert('Điểm danh thành công!');
      fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  if (loading) return <div className="p-4 text-slate-500 dark:text-slate-400">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="animate-fade-in p-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Lịch Sử & Lịch Thi Đấu</h2>
      {matches.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-center text-slate-500 dark:text-slate-400">
          Đội của bạn chưa có trận đấu nào.
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map(m => (
            <div key={m.matchId} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                    {m.sportName || 'Đang cập nhật'}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-900 dark:text-white rounded-full text-xs font-medium">
                    {m.matchType || 'Giao hữu'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.matchStatus === 'Completed' ? 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 dark:text-slate-300 ' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                    {m.matchStatus || 'Sắp diễn ra'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {m.homeTeamName || 'Đội nhà'} <span className="text-slate-400 font-normal mx-2">vs</span> {m.awayTeamName || 'Đội khách'}
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : 'Chưa xếp lịch'}
                </div>
                {m.location && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {m.location.includes('(GPS:') ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.location.split('GPS:')[1].replace(')', '').trim())}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-emerald-500 truncate max-w-xs md:max-w-md"
                        title={m.location}
                      >
                        {m.location}
                      </a>
                    ) : (
                      <span className="truncate max-w-xs md:max-w-md" title={m.location}>{m.location}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {m.matchStatus === 'Completed' ? (
                  <div className="text-2xl font-bold text-slate-800 dark:text-white tracking-wider">
                    {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                  </div>
                ) : (
                  <div className="flex gap-2">
                      <button 
                      onClick={() => handleVote(m.matchId || m.MatchId, true)} 
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${(m.myVote === true || m.MyVote === true) ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 dark:border-emerald-800'}`}
                    >
                      {(m.myVote === true || m.MyVote === true) ? 'ĐÃ ĐIỂM DANH' : 'ĐI'}
                    </button>
                    <button 
                      onClick={() => handleVote(m.matchId || m.MatchId, false)} 
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${(m.myVote === false || m.MyVote === false) ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30' : 'bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 border border-rose-100 dark:border-rose-800'}`}
                    >
                      {(m.myVote === false || m.MyVote === false) ? 'ĐÃ BÁO VẮNG' : 'NGHỈ'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
