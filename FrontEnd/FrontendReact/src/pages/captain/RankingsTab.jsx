import React, { useState, useEffect } from 'react';
import { captainService } from '../../services/captainService';
import playerService from '../../services/playerService';
import { FiTrendingUp, FiMapPin, FiAward, FiStar, FiCalendar, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export default function RankingsTab() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const data = await captainService.getTeamRankings();
      setRankings(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (teamId) => {
    if (!isAuthenticated || user.role !== 'Player') {
      window.location.href = '/login';
      return;
    }
    
    try {
      setActionLoading(true);
      await playerService.requestJoin(teamId);
      alert('Đã gửi yêu cầu ứng tuyển thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi ứng tuyển. Có thể bạn đã gửi yêu cầu trước đó.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Đang tải bảng xếp hạng...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiTrendingUp className="text-blue-600 dark:text-blue-400" /> Bảng Xếp Hạng đội thể thao
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hệ thống xếp hạng dựa trên kết quả và đánh giá từ đối thủ</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <input 
          type="text"
          placeholder="Tìm kiếm đội..."
          className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]"
          value={areaFilter}
          onChange={e => setAreaFilter(e.target.value)}
        >
          <option value="">Tất cả khu vực</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="TP.HCM">TP.HCM</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
        </select>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-20">Hạng</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên đội thể thao</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khu vực</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Điểm Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {rankings
                .filter(team => team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(team => areaFilter ? team.homeArea?.includes(areaFilter) : true)
                .map((team, index) => (
                <tr 
                  key={team.teamId || `rank-${index}`} 
                  onClick={() => setSelectedTeam(team)}
                  className="hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 text-center">
                    {index === 0 ? <FiAward className="mx-auto text-yellow-500 w-6 h-6" /> :
                     index === 1 ? <FiAward className="mx-auto text-slate-400 w-6 h-6" /> :
                     index === 2 ? <FiAward className="mx-auto text-amber-600 w-6 h-6" /> :
                     <span className="font-bold text-slate-400">{index + 1}</span>}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100 text-lg">
                    {team.teamName}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                      <FiMapPin className="text-rose-400" />
                      <span>{team.homeArea || 'Chưa xác định'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-blue-600 text-xl">
                    {team.rankingScore}
                  </td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu xếp hạng</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/30">
                    {selectedTeam.teamName ? selectedTeam.teamName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedTeam.teamName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
                        {selectedTeam.sportName || 'Bóng đá'}
                      </span>
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-500/20">
                        Rank: {selectedTeam.rankingScore ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white text-xl p-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Khu vực hoạt động</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <FiMapPin className="mr-2 text-rose-500" />
                    {selectedTeam.homeArea || 'Chưa cập nhật khu vực'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cấp độ</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <FiUsers className="mr-2 text-emerald-500" />
                    {selectedTeam.captainName || 'Ẩn danh'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trình độ</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <FiStar className="mr-2 text-blue-500" />
                    {selectedTeam.qualityLevel || 'Chưa phân loại'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Đội trưởng</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <FiUsers className="mr-2 text-emerald-500" />
                    {selectedTeam.captainName || 'Ẩn danh'}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Giới thiệu</h4>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed">
                  {selectedTeam.history || 'Đội thể thao chưa cập nhật thông tin giới thiệu chi tiết.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

