import React, { useState, useEffect } from 'react';
import { publicService } from '../services/publicService';
import { FiTrendingUp, FiMapPin, FiAward, FiUsers, FiX, FiCalendar } from 'react-icons/fi';
import { PublicHeader } from '../components/portal-ui';

export default function PublicRankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sportId, setSportId] = useState(1);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetailsLoading, setTeamDetailsLoading] = useState(false);

  useEffect(() => {
    fetchRankings(sportId);
  }, [sportId]);

  const fetchRankings = async (sId) => {
    try {
      setLoading(true);
      const data = await publicService.getTeamRankings(sId);
      setRankings(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = async (teamId) => {
    setSelectedTeam({ id: teamId, loading: true });
    setTeamDetailsLoading(true);
    try {
      const data = await publicService.getTeam(teamId);
      setSelectedTeam({ ...data, loading: false });
    } catch (err) {
      alert('Không thể tải thông tin đội bóng');
      setSelectedTeam(null);
    } finally {
      setTeamDetailsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <PublicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <FiTrendingUp className="text-emerald-600" /> Bảng Xếp Hạng Đội Thể Thao
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Top những đội có điểm số và thành tích tốt nhất trên hệ thống.
          </p>
          <div className="mt-6 flex justify-center">
            <select
              value={sportId}
              onChange={(e) => setSportId(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            >
              <option value={1}>Bóng đá</option>
              <option value={2}>Cầu lông</option>
              <option value={3}>Pickleball</option>
              <option value={4}>Khác</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-emerald-600 animate-pulse font-bold text-xl">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl max-w-2xl mx-auto">{error}</div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-700/50 overflow-hidden max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xếp hạng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đội Thể Thao</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Môn</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khu Vực</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {rankings.map((team, index) => (
                    <tr key={team.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${(index % 20) * 50}ms`, animationFillMode: 'both' }}>
                      <td className="py-5 px-6 text-center">
                        {index === 0 ? <FiAward className="mx-auto text-yellow-500 w-8 h-8" /> :
                         index === 1 ? <FiAward className="mx-auto text-slate-400 w-8 h-8" /> :
                         index === 2 ? <FiAward className="mx-auto text-amber-600 w-8 h-8" /> :
                         <span className="font-bold text-slate-400 text-lg">{index + 1}</span>}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button onClick={() => handleViewTeam(team.id)} className="flex items-center hover:opacity-80 transition-opacity text-left">
                          <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-200">
                            {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">{team.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><FiMapPin /> {team.homeArea || 'Đang cập nhật'}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-medium">
                          {team.sportName || 'Đang cập nhật'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {team.homeArea || 'Đang cập nhật'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center font-bold text-emerald-600 text-2xl">
                        {team.rankingScore}
                      </td>
                    </tr>
                  ))}
                  {rankings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu xếp hạng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FiUsers className="text-emerald-500" /> Chi Tiết Đội Bóng
              </h3>
              <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {teamDetailsLoading || selectedTeam.loading ? (
                <div className="text-center py-12 text-emerald-600 animate-pulse font-bold">Đang tải thông tin đội...</div>
              ) : (
                <div className="space-y-8">
                  {/* Team Header */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {selectedTeam.logoUrl ? (
                      <img src={selectedTeam.logoUrl} alt="Logo" className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-md object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-3xl shadow-md shrink-0">
                        {selectedTeam.teamName ? selectedTeam.teamName.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                    <div className="text-center md:text-left flex-1">
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">{selectedTeam.teamName}</h4>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-lg">Ranking: {selectedTeam.rankingScore} điểm <span className="text-amber-500 ml-2">| Fairplay: {selectedTeam.fairplayScore ?? 100} điểm</span></p>
                      <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"><FiMapPin /> {selectedTeam.homeArea || 'Chưa cập nhật khu vực'}</span>
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1"><FiAward /> {selectedTeam.qualityLevel || 'Chưa phân cấp'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Members List */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h5 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <FiUsers className="text-emerald-500" /> Thành viên ({selectedTeam.members?.length || 0})
                      </h5>
                      {(!selectedTeam.members || selectedTeam.members.length === 0) ? (
                        <p className="text-slate-500 text-sm">Chưa có thành viên nào.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedTeam.members.map((m, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                              <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{m.fullName || `User ${m.userId}`}</span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${m.role === 'Captain' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {m.role === 'Captain' ? 'Đội trưởng' : 'Cầu thủ'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tournaments List */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h5 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <FiAward className="text-amber-500" /> Giải đấu đã tham gia ({selectedTeam.tournaments?.length || 0})
                      </h5>
                      {(!selectedTeam.tournaments || selectedTeam.tournaments.length === 0) ? (
                        <p className="text-slate-500 text-sm">Chưa tham gia giải đấu nào.</p>
                      ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedTeam.tournaments.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <FiAward />
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{t.tournamentName || `Giải #${t.tournamentId}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedTeam.history && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h5 className="font-bold text-slate-800 dark:text-white mb-2">Giới thiệu đội bóng</h5>
                      <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap">{selectedTeam.history}</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

