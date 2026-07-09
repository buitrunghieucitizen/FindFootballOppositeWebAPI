import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';
import sportService from '../../services/sportService';
import { FiSearch, FiMapPin, FiUsers, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function PlayerTeamsTab() {
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    sportId: '',
    quality: '',
    ward: ''
  });

  useEffect(() => {
    loadSports();
  }, []);

  useEffect(() => {
    loadTeams();
  }, [page, filters.sportId, filters.quality, filters.ward]); // re-fetch when page or filter dropdowns change

  const loadSports = async () => {
    try {
      const res = await sportService.getSports();
      const sportsData = res.data?.data || res.data?.$values || res.data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error('Lỗi tải môn thể thao:', err);
    }
  };

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        pageSize: 6,
        search: filters.search || undefined,
        sportId: filters.sportId || undefined,
        quality: filters.quality || undefined,
        ward: filters.ward || undefined
      };
      
      const res = await playerService.getNearbyTeams(params);
      setTeams(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError('Không thể tải danh sách đội thể thao.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    loadTeams();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleApplyToTeam = async (teamId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await playerService.requestJoin(teamId);
      Swal.fire({
        title: 'Thành công!',
        text: 'Đã gửi yêu cầu tham gia đội thành công!',
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu. Bạn có thể đã gửi yêu cầu trước đó.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tìm Đội Thể Thao</h2>
          <p className="text-slate-500 dark:text-slate-400">Khám phá và tham gia các đội thể thao đang tuyển thành viên</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Filters Area */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-4 lg:col-span-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên đội..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            />
          </div>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Khu vực (VD: Quận 1)" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={filters.ward}
              onChange={(e) => setFilters(prev => ({...prev, ward: e.target.value}))}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={filters.sportId}
            onChange={(e) => handleFilterChange('sportId', e.target.value)}
          >
            <option value="">Tất cả môn thể thao</option>
            {sports.map(s => (
              <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={filters.quality}
            onChange={(e) => handleFilterChange('quality', e.target.value)}
          >
            <option value="">Tất cả trình độ</option>
            <option value="Yếu">Yếu</option>
            <option value="Trung bình yếu">Trung bình yếu</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Trung bình khá">Trung bình khá</option>
            <option value="Khá">Khá</option>
            <option value="Mạnh">Mạnh</option>
          </select>
          <div className="col-span-1 md:col-span-4 flex justify-end">
             <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2">
               <FiSearch /> Tìm Kiếm
             </button>
          </div>
        </form>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 animate-pulse">
          Đang tải danh sách đội...
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FiSearch className="text-2xl" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Không tìm thấy đội thể thao nào phù hợp với tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(t => (
            <div key={t.teamId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-indigo-600 font-bold text-2xl border-4 border-slate-50">
                  {t.teamName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-white dark:bg-slate-800/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/30">
                  {t.sportName || 'Thể thao'}
                </div>
              </div>
              <div className="pt-12 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white line-clamp-1">{t.teamName}</h3>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiMapPin className="text-slate-400" />
                    <span className="truncate">{t.homeArea || 'Chưa cập nhật khu vực'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiFilter className="text-slate-400" />
                    <span>Trình độ: <strong className="text-slate-700 dark:text-slate-200">{t.qualityLevel || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <FiUsers className="text-slate-400" />
                    <span>Trạng thái: <strong className={t.lookingForOpponent ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}>
                      {t.lookingForOpponent ? 'Đang tìm đối' : 'Đang nghỉ'}
                    </strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyToTeam(t.teamId)}
                  disabled={actionLoading}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 text-indigo-600 font-bold rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  Xin gia nhập
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
          >
            <FiChevronLeft />
          </button>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Trang {page} / {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
