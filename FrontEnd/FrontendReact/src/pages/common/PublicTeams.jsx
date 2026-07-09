import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import playerService from '../../services/playerService';
import { useAuth } from '../../contexts/AuthContext';
import { FiUsers, FiMapPin, FiStar, FiCalendar, FiArrowLeft, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/portal-ui';
import Pagination from '../../components/Pagination';

export default function PublicTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: '',
    rankingTier: '',
    homeArea: '',
    minFairplay: ''
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
        setTeams(data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đội thể thao. Vui lòng thử lại sau.');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 dark:bg-slate-950 font-sans">
      <PublicHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white font-medium mb-4 transition-colors">
              <FiArrowLeft className="mr-2" /> Quay lại trang chủ
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Khám Phá Các đội thể thao</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Tìm kiếm và kết nối với hàng trăm đội thể thao phong trào trên toàn quốc.</p>
          </div>
          
          <div className="flex gap-4">
            <Link 
              to={isAuthenticated ? (user.role === 'Captain' ? '/captain-home' : '/player-home?tab=members') : '/login'} 
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-emerald-300 transition-all shadow-sm"
            >
              Tạo đội của bạn
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Tìm kiếm</label>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Tên đội bóng..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && fetchTeams(1)}
                className="w-full px-4 py-2 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button 
                onClick={() => fetchTeams(1)}
                className="px-4 py-2 bg-wc-gold-500 hover:bg-wc-gold-600 text-wc-navy-950 font-bold rounded-r-xl flex items-center justify-center transition-all shadow-sm"
              >
                <FiSearch />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Điểm ranking</label>
            <select 
              value={filters.rankingTier}
              onChange={(e) => setFilters(prev => ({ ...prev, rankingTier: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">Tất cả</option>
              <option value="yếu">Dưới 20 điểm</option>
              <option value="trung bình">Từ 20 - 50 điểm</option>
              <option value="khá">Từ 50 - 100 điểm</option>
              <option value="đá hay">Trên 100 điểm</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Khu vực</label>
            <input 
              type="text" 
              placeholder="VD: Cầu Giấy, Hà Nội" 
              value={filters.homeArea}
              onChange={(e) => setFilters(prev => ({ ...prev, homeArea: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchTeams(1)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Điểm Fairplay</label>
            <select 
              value={filters.minFairplay}
              onChange={(e) => setFilters(prev => ({ ...prev, minFairplay: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Tất cả</option>
              <option value="80">Trên 80</option>
              <option value="90">Trên 90</option>
              <option value="100">100 tuyệt đối</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl mb-8 flex items-center">
            <FiStar className="mr-3 text-rose-500 text-xl" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse h-64">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4"></div>
                <div className="w-3/4 h-6 bg-slate-200 rounded-md mb-2"></div>
                <div className="w-1/2 h-4 bg-slate-200 rounded-md mb-4"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-slate-200 rounded-md"></div>
                  <div className="w-full h-4 bg-slate-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-900 dark:text-white">
              <FiUsers className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có đội thể thao nào</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Hiện tại hệ thống chưa ghi nhận đội thể thao nào. Hãy là người đầu tiên tạo đội thể thao của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team, index) => (
              <div 
                key={team.id || index} 
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 border border-slate-100 dark:border-slate-700 hover:border-slate-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
                    {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
                      {team.sportName || 'Chưa cập nhật'}
                    </span>
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                      Điểm ranking: {team.rankingScore || 0}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  {team.name}
                </h3>
                
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <FiMapPin className="mr-2 text-rose-400" />
                    <span className="truncate">{team.homeArea || 'Chưa cập nhật khu vực'}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <FiCalendar className="mr-2 text-amber-500" />
                    <span>Thành lập: {team.createdAt ? new Date(team.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 h-10">
                  {team.history || 'Đội thể thao chưa cập nhật thông tin giới thiệu.'}
                </p>
                
                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/teams/${team.id}`}
                    className="flex-1 py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all"
                  >
                    Xem chi tiết
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(team.id);
                    }}
                    disabled={actionLoading}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-center text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    Xin gia nhập
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={fetchTeams} 
          />
        )}
      </main>
    </div>
  );
}

