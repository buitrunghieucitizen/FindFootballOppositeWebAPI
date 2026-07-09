import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { publicService } from '../../services/publicService';
import { captainService } from '../../services/captainService';
import { FiUsers, FiMapPin, FiStar, FiCheckCircle, FiSearch, FiPlusCircle, FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import Swal from 'sweetalert2';

export default function InviteOpponent_Captain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: '',
    rankingTier: '',
    homeArea: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    totalPages: 1,
    totalCount: 0
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const matchId = localStorage.getItem('bookingMatchId'); // Hoặc truyền qua state router, tạm dùng localStorage như cũ

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetchTeams(pagination.page);
  }, [debouncedFilters, pagination.page]);

  const fetchTeams = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page,
        pageSize: pagination.pageSize,
        ...debouncedFilters
      };
      
      const data = await publicService.getTeams(params);
      
      if (data && data.items) {
        setTeams(data.items);
        setPagination(prev => ({ ...prev, page, totalPages: data.totalPages, totalCount: data.totalCount }));
      } else {
        setTeams(data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách đội bóng.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (teamId) => {
    if (!matchId) {
      Swal.fire('Lỗi', 'Không tìm thấy thông tin trận đấu (MatchId). Vui lòng tạo kèo lại từ đầu.', 'error');
      return;
    }
    
    try {
      setActionLoading(true);
      await captainService.inviteTeamToMatch(matchId, teamId);
      Swal.fire('Thành công', 'Đã gửi lời mời giao hữu thành công!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời.';
      Swal.fire('Lỗi', msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem('bookingMatchId');
    navigate('/captain-home?tab=matches');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-amber-50/20 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-navy-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Gradient Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wc-navy-800 via-wc-navy-900 to-slate-900 dark:from-wc-navy-800 dark:via-wc-navy-900 dark:to-slate-900 p-6 sm:p-8 shadow-xl shadow-wc-navy-900/30 dark:shadow-wc-navy-950/40 animate-fade-in">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => navigate('/captain/match/book-stadium')}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft size={22} className="text-white" />
            </button>
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
              <FiSearch size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Bước 3: Mời Đối Thủ</h1>
              <p className="text-emerald-100/80 text-sm mt-0.5">Tìm kiếm và gửi lời mời giao hữu đến các đội bóng khác</p>
            </div>
          </div>
        </div>

        {/* ── Step Indicators ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 border border-white/50 dark:border-slate-700/50 shadow-sm">
            {[
              { icon: FiPlusCircle, label: 'Tạo kèo', active: false },
              { icon: FiCheckCircle, label: 'Đặt sân', active: false },
              { icon: FiSearch, label: 'Tìm đối', active: true },
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.active ? 'bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 shadow-lg shadow-wc-gold-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                    <step.icon size={18} />
                  </div>
                  <span className={`text-xs font-semibold ${step.active ? 'text-wc-gold-600 dark:text-wc-gold-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {idx + 1}. {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="flex-1 max-w-[50px] sm:max-w-[100px] h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent opacity-50" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đội bóng..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <select
                value={filters.rankingTier}
                onChange={(e) => setFilters(prev => ({ ...prev, rankingTier: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Tất cả hạng</option>
                <option value="Đồng">Hạng Đồng</option>
                <option value="Bạc">Hạng Bạc</option>
                <option value="Vàng">Hạng Vàng</option>
                <option value="Kim Cương">Hạng Kim Cương</option>
              </select>
            </div>
            <div>
              <select
                value={filters.homeArea}
                onChange={(e) => setFilters(prev => ({ ...prev, homeArea: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Tất cả khu vực</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 2">Quận 2</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Bình Thạnh">Bình Thạnh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team List */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tìm kiếm đội bóng...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>
        ) : teams.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Không tìm thấy đội bóng nào</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <div key={team.teamId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
                  <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                    {team.avatar ? (
                      <img src={team.avatar} alt={team.teamName} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 absolute -bottom-10 shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 absolute -bottom-10 shadow-lg flex items-center justify-center">
                        <FiUsers className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-14 p-6 flex-1 flex flex-col">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{team.teamName}</h3>
                      <div className="flex items-center justify-center text-sm text-slate-500 gap-3">
                        <span className="flex items-center gap-1"><FiMapPin className="text-rose-400"/> {team.homeArea || 'Chưa cập nhật'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500 mb-1">Điểm Ranking</div>
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">{team.rankingScore || 0}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500 mb-1">Đánh giá</div>
                        <div className="font-bold text-amber-500 flex items-center justify-center gap-1">
                          <FiStar className="fill-current"/> {team.rating ? team.rating.toFixed(1) : 'Chưa có'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <button 
                        onClick={() => handleInvite(team.teamId)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        <FiSend /> Mời giao hữu
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}

        <div className="flex justify-center mt-8 pb-8">
          <button 
            onClick={handleFinish}
            className="px-8 py-3 bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-600 hover:to-wc-gold-700 text-wc-navy-950 font-bold rounded-xl shadow-xl transition-all transform hover:scale-105"
          >
            Hoàn tất & Về danh sách trận đấu
          </button>
        </div>

      </div>
    </div>
  );
}
