import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import { useAuth } from '../../contexts/AuthContext';
import { FiAward, FiMapPin, FiCalendar, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/portal-ui';

export default function PublicTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [filters, setFilters] = useState({ search: '', sportId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [filters.sportId]);

  const fetchSports = async () => {
    try {
      const data = await publicService.getSports();
      const sportsData = data?.data || data?.$values || data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await publicService.getTournaments(filters);
      setTournaments(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách giải đấu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Upcoming') return 'bg-amber-100 text-amber-700';
    if (status === 'InProgress') return 'bg-emerald-100 text-emerald-700 animate-pulse';
    if (status === 'Completed') return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusText = (status) => {
    if (status === 'Upcoming') return 'Sắp khởi tranh';
    if (status === 'InProgress') return 'Đang diễn ra';
    if (status === 'Completed') return 'Đã kết thúc';
    return status || 'Đang chờ';
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Giải Đấu Chuyên Nghiệp</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Tham gia các giải đấu phong trào để cọ xát và giành cúp vàng.</p>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => isAuthenticated ? alert('Chức năng đang phát triển!') : window.location.href='/login'} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5">
              Tổ chức Giải đấu
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên giải đấu, sân..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={filters.sportId}
            onChange={(e) => setFilters(prev => ({...prev, sportId: e.target.value}))}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
          >
            <option value="">Tất cả môn thể thao</option>
            {sports.map(s => (
              <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
            ))}
          </select>
          <button
            onClick={() => fetchTournaments()}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl transition-colors hover:from-amber-600 hover:to-orange-600"
          >
            Tìm kiếm
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse font-medium">Đang tải danh sách giải đấu...</div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <FiAward className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có giải đấu nào</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Hệ thống chưa ghi nhận giải đấu nào trong thời gian tới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tournaments.map((tournament, index) => (
              <div key={tournament.id || index} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-amber-900/10 border border-slate-100 dark:border-slate-700 hover:border-amber-100 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/50 relative z-10">
                  <FiAward className="w-16 h-16 text-amber-500 mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full text-center ${getStatusColor(tournament.status)}`}>
                    {getStatusText(tournament.status)}
                  </span>
                </div>
                
                <div className="flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {tournament.name}
                    </h3>
                  </div>
                  
                  <div className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mb-4">
                    Thể thức: {tournament.format || 'Đang cập nhật'}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                      <FiCalendar className="mr-3 text-indigo-500 text-lg" />
                      <span>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'Sắp diễn ra'} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('vi-VN') : 'Chưa rõ'}</span>
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                      <FiMapPin className="mr-3 text-rose-500 text-lg" />
                      <span className="truncate">Sân: {tournament.stadiumName}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                    {tournament.description || 'Giải đấu hứa hẹn mang lại những trận cầu nảy lửa và hấp dẫn.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      to={`/tournaments/${tournament.id}`}
                      className="py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors w-full sm:w-auto text-center"
                    >
                      Xem Chi Tiết
                    </Link>
                    <button 
                      onClick={() => isAuthenticated ? alert('Gửi yêu cầu đăng ký tham gia thành công (Demo)!') : window.location.href='/login'}
                      className="py-3 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md w-full sm:w-auto flex-1 text-center"
                    >
                      Đăng Ký
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
