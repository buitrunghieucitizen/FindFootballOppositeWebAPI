import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import { directMessageService } from '../../services/directMessageService';
import { useAuth } from '../../contexts/AuthContext';
import { FiMessageSquare, FiMapPin, FiShield, FiCalendar, FiSearch, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination';

export default function TeamList_Captain({ setActiveTab }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const currentUserId = user?.id || user?.userId;

  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: '',
    rankingTier: '',
    homeArea: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchTeams(1);
  }, []);

  const fetchTeams = async (page = pagination.page) => {
    try {
      setLoading(true);
      const data = await publicService.getTeams({ ...filters, page, pageSize: pagination.pageSize });
      if (data.teams) {
        setTeams(data.teams);
        setPagination(prev => ({ ...prev, page, totalPages: data.totalPages, totalCount: data.totalCount }));
      } else {
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load teams', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (captainId, teamName) => {
    try {
      // Create an initial message or just open the chat
      if (!captainId) {
        alert("Đội bóng mà bạn chọn chưa có đội trưởng để nhận tin nhắn.");
        return;
      }
      if (captainId === parseInt(currentUserId)) {
        alert("Đây là đội bóng của bạn.");
        return;
      }
      
      // Auto send a hi message
      await directMessageService.sendMessage(captainId, `Xin chào, tôi đến từ trang Danh sách đội bóng. Rất vui được biết đội ${teamName}!`);
      
      // Navigate to messages tab
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể bắt đầu cuộc trò chuyện.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Danh sách các đội bóng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tìm kiếm và kết nối với các đội bóng khác trên hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-wc-navy-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-wc-navy-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative flex">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên đội..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && fetchTeams(1)}
            className="w-full pl-10 pr-4 py-2.5 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-wc-gold-500/20 focus:border-wc-gold-500 outline-none transition-all"
          />
          <button onClick={() => fetchTeams(1)} className="px-6 py-2.5 bg-wc-gold-500 hover:bg-wc-gold-600 text-wc-navy-950 font-bold rounded-r-xl flex items-center gap-2 transition-all">
            <FiSearch /> Tìm kiếm
          </button>
        </div>
        <div className="w-full md:w-48 relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={filters.rankingTier}
            onChange={(e) => setFilters(prev => ({ ...prev, rankingTier: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-wc-gold-500/20 focus:border-wc-gold-500 outline-none transition-all appearance-none"
          >
            <option value="">Tất cả điểm ranking</option>
            <option value="yếu">Dưới 20 điểm</option>
            <option value="trung bình">Từ 20-50 điểm</option>
            <option value="khá">Từ 50-100 điểm</option>
            <option value="đá hay">Trên 100 điểm</option>
          </select>
        </div>
        <div className="w-full md:w-48 relative">
          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Khu vực (VD: Hà Nội)" 
            value={filters.homeArea}
            onChange={(e) => setFilters(prev => ({ ...prev, homeArea: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-wc-gold-500/20 focus:border-wc-gold-500 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={team.teamId || team.id} className="bg-white dark:bg-wc-navy-800 rounded-2xl shadow-sm border border-slate-100 dark:border-wc-navy-700 p-6 hover:shadow-md transition-shadow flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-wc-navy-800 to-wc-navy-950 flex items-center justify-center text-wc-gold-400 text-xl font-bold shadow-sm">
                      {team.name ? team.name.charAt(0).toUpperCase() : (team.teamName ? team.teamName.charAt(0).toUpperCase() : 'T')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-wc-gold-500 transition-colors">{team.name || team.teamName}</h3>
                      <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-wc-navy-100 text-wc-navy-700 dark:bg-wc-navy-900 dark:text-wc-gold-400">
                        {team.sportName || 'Bóng đá'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <FiMapPin className="mr-2 text-slate-400" />
                    {team.homeArea || 'Chưa cập nhật khu vực'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <FiShield className="mr-2 text-slate-400" />
                    Điểm Ranking: <span className="ml-1 font-bold text-slate-700 dark:text-slate-300">{team.rankingScore || 0}</span>
                  </div>
                </div>

                {team.history && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 italic">"{team.history}"</p>
                )}

                <div className="flex gap-2">
                  <Link
                    to={`/teams/${team.teamId || team.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-wc-navy-700 dark:text-slate-200 dark:hover:bg-wc-navy-600 transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    onClick={() => handleMessage(team.captainId, team.teamName || team.name)}
                    disabled={team.captainId === parseInt(currentUserId)}
                    className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                      ${team.captainId === parseInt(currentUserId) 
                        ? 'bg-slate-100 text-slate-400 dark:bg-wc-navy-900 dark:text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 shadow-md shadow-wc-gold-500/20 hover:shadow-lg hover:-translate-y-0.5'}`}
                  >
                    <FiMessageSquare className="mr-2 hidden lg:block" />
                    {team.captainId === parseInt(currentUserId) ? 'Đội của bạn' : 'Nhắn tin'}
                  </button>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white dark:bg-wc-navy-800 rounded-2xl border border-gray-100 dark:border-wc-navy-700">
                <div className="text-4xl mb-4">🏆</div>
                <p className="text-gray-500 dark:text-slate-400">Không tìm thấy đội bóng nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={fetchTeams} 
            />
          )}
        </>
      )}
    </div>
  );
}
