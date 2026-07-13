import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import { captainService } from '../../services/captainService';
import { useAuth } from '../../contexts/AuthContext';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiAward, FiShield, FiMessageSquare, FiX, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { PublicHeader } from '../../components/portal-ui';
import LocationDisplay from '../../components/LocationDisplay';

export default function PublicMatches() {
  const [matches, setMatches] = useState([]);
  const [sports, setSports] = useState([]);
  const [filters, setFilters] = useState({ search: '', sportId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchMatches();
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

  const handleRequestToJoin = async () => {
    if (!isAuthenticated) {
      Swal.fire('Yêu cầu đăng nhập', 'Vui lòng đăng nhập bằng tài khoản Đội trưởng để bắt kèo!', 'warning');
      return;
    }
    try {
      setIsRequesting(true);

      const checkRes = await captainService.checkMatchRank(selectedMatch.matchId);
      if (checkRes.showWarning) {
        const confirmResult = await Swal.fire({
          title: 'Cảnh báo chênh lệch',
          text: checkRes.message,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Vẫn bắt kèo',
          cancelButtonText: 'Hủy'
        });
        
        if (!confirmResult.isConfirmed) {
          setIsRequesting(false);
          return;
        }
      }

      await captainService.requestToJoinMatch(selectedMatch.matchId, { message: requestMessage });
      Swal.fire('Thành công', 'Đã gửi yêu cầu bắt kèo thành công!', 'success');
      setSelectedMatch(null);
      setRequestMessage('');
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi bắt kèo.', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await publicService.getMatches(filters);
      setMatches(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách trận đấu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Scheduled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Completed') return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ';
    if (status === 'Cancelled') return 'bg-rose-100 text-rose-700';
    if (status === 'LookingForOpponent') return 'bg-indigo-100 text-indigo-700 animate-pulse';
    return 'bg-amber-100 text-amber-700';
  };

  const getStatusText = (status) => {
    if (status === 'Scheduled') return 'Đã lên lịch';
    if (status === 'Completed') return 'Đã kết thúc';
    if (status === 'Cancelled') return 'Đã hủy';
    if (status === 'LookingForOpponent') return 'Đang tìm đối';
    if (status === 'Accepted') return 'Đã chốt kèo';
    if (status === 'ExternalBooked') return 'Đã đặt sân ngoài';
    return status || 'Đang chờ';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 dark:bg-slate-950 font-sans">
      <PublicHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white font-medium mb-4 transition-colors">
              <FiArrowLeft className="mr-2" /> Quay lại trang chủ 
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Lịch Thi Đấu & Giao Hữu</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Theo dõi lịch thi đấu hoặc tìm đối tác giao hữu cho đội của bạn.</p>
          </div>
          
          <div className="flex gap-4">
            <Link to={isAuthenticated ? "/player-home" : "/login"} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5">
              Tạo trận giao hữu
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm theo tên đội, sân..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filters.sportId}
            onChange={(e) => setFilters(prev => ({...prev, sportId: e.target.value}))}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
          >
            <option value="">Tất cả môn thể thao</option>
            {sports.map(s => (
              <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
            ))}
          </select>
          <button
            onClick={() => fetchMatches()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <FiSearch /> Tìm kiếm
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse font-medium">Đang tải danh sách trận đấu...</div>
        ) : matches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <FiCalendar className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có trận đấu nào</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Hệ thống chưa ghi nhận trận đấu nào sắp tới. Hãy là người đầu tiên tạo trận giao hữu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div 
                key={match.matchId || `public-match-${index}`} 
                onClick={() => setSelectedMatch(match)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(match.matchStatus)}`}>
                      {getStatusText(match.matchStatus)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {match.matchType || 'Giao hữu'}
                    </span>
                    {match.sportName && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 border border-amber-100">
                        {match.sportName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform overflow-hidden">
                      {match.matchType === 'PickUp' && match.homeTeamAvatar ? (
                        <img src={match.homeTeamAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FiShield className="text-2xl text-slate-400" />
                      )}
                    </div>
                    {match.homeTeamId ? (
                      <Link to={`/teams/${match.homeTeamId}`} className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {match.homeTeamName || 'Đội nhà'}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{match.homeTeamName || 'Đội nhà'}</span>
                    )}
                  </div>
                  
                  <div className="px-4 text-center">
                    <span className="text-sm font-bold text-slate-300">VS</span>
                    {(match.matchStatus === 'Completed' || match.homeScore !== null || match.awayScore !== null) && (
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                      </div>
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                      <FiShield className="text-2xl text-slate-400" />
                    </div>
                    {match.awayTeamId ? (
                      <Link to={`/teams/${match.awayTeamId}`} className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {match.awayTeamName || 'Đội khách'}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{match.awayTeamName || 'Đội khách'}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <FiCalendar className="mr-2 text-slate-400" />
                    {(match.matchDate || match.MatchDate) ? `${new Date(match.matchDate || match.MatchDate).toLocaleDateString('vi-VN')} ${(match.startTime || match.StartTime) ? (match.startTime || match.StartTime).substring(0,5) : ''}` : 'Chưa xếp lịch'}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <FiMapPin className="mr-2 text-slate-400 shrink-0" />
                    <LocationDisplay 
                      location={match.location || match.Location || match.stadiumName} 
                      className="line-clamp-1"
                    />
                  </div>
                </div>

                {/* Bắt kèo & Nhắn tin buttons */}
                {(match.matchStatus === 'LookingForOpponent' || match.matchStatus === 'Scheduled') && (!match.awayTeamName || match.awayTeamName === 'Đang tìm đối thủ' || match.awayTeamName === 'Đội khách') && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatch(match);
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                    >
                      Bắt kèo ngay
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        Swal.fire('Thông báo', 'Tính năng nhắn tin trực tiếp cho Đội trưởng đang được cập nhật!', 'info');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors shadow-sm"
                      title="Nhắn tin cho đội này"
                    >
                      <FiMessageSquare />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in relative">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Chi tiết trận đấu</h3>
                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div 
                  className={`text-center flex-1 ${selectedMatch.matchType === 'PickUp' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={() => {
                    if (selectedMatch.matchType === 'PickUp') {
                      Swal.fire({
                        title: 'Thông tin người tạo',
                        html: `
                          <div class="flex flex-col items-center">
                            <img src="${selectedMatch.homeTeamAvatar || 'https://placehold.co/100x100/slate/white?text=Avatar'}" class="w-24 h-24 rounded-full mb-4 object-cover border-4 border-slate-100 shadow-sm" />
                            <h3 class="font-bold text-xl mb-1">${selectedMatch.homeTeamName || 'Người chơi ẩn'}</h3>
                            <p class="text-slate-500 font-medium">SĐT: ${selectedMatch.homeTeamPhone || 'Không công khai'}</p>
                          </div>
                        `,
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#4f46e5'
                      });
                    }
                  }}
                  title={selectedMatch.matchType === 'PickUp' ? "Nhấn để xem thông tin cá nhân" : ""}
                >
                  <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {selectedMatch.matchType === 'PickUp' && selectedMatch.homeTeamAvatar ? (
                      <img src={selectedMatch.homeTeamAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FiShield className="text-4xl text-blue-500" />
                    )}
                  </div>
                  {selectedMatch.homeTeamId ? (
                    <Link to={`/teams/${selectedMatch.homeTeamId}`} onClick={() => setSelectedMatch(null)} className="font-bold text-lg text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {selectedMatch.homeTeamName || 'Đội nhà'}
                    </Link>
                  ) : (
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{selectedMatch.homeTeamName || 'Đội nhà'}</span>
                  )}
                </div>
                
                <div className="px-6 text-center">
                  <span className="text-sm font-bold text-slate-400 mb-2 block">VS</span>
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">
                    {selectedMatch.matchStatus === 'Completed' ? `${selectedMatch.homeScore ?? '-'} : ${selectedMatch.awayScore ?? '-'}` : '- : -'}
                  </div>
                  <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedMatch.matchStatus)}`}>
                    {getStatusText(selectedMatch.matchStatus)}
                  </span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-200 dark:border-slate-700">
                    <FiShield className="text-4xl text-rose-500" />
                  </div>
                  {selectedMatch.awayTeamId ? (
                    <Link to={`/teams/${selectedMatch.awayTeamId}`} onClick={() => setSelectedMatch(null)} className="font-bold text-lg text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {selectedMatch.awayTeamName || 'Đội khách'}
                    </Link>
                  ) : (
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{selectedMatch.awayTeamName || 'Đội khách'}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thời gian</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <FiCalendar className="mr-2 text-slate-400" />
                    {(selectedMatch.matchDate || selectedMatch.MatchDate) ? `${new Date(selectedMatch.matchDate || selectedMatch.MatchDate).toLocaleDateString('vi-VN')} ${(selectedMatch.startTime || selectedMatch.StartTime) ? (selectedMatch.startTime || selectedMatch.StartTime).substring(0,5) : ''}` : 'Chưa xếp lịch'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Địa điểm</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-start">
                    <FiMapPin className="mr-2 mt-1 text-rose-500 shrink-0" />
                    <LocationDisplay 
                      location={selectedMatch.location || selectedMatch.Location || selectedMatch.stadiumName} 
                      showMapLink={true}
                    />
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Loại trận</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedMatch.matchType || 'Giao hữu'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Môn thể thao</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedMatch.sportName || 'Bóng đá'}
                  </div>
                </div>
              </div>

              {(selectedMatch.matchStatus === 'LookingForOpponent' || selectedMatch.matchStatus === 'Scheduled') && (!selectedMatch.awayTeamName || selectedMatch.awayTeamName === 'Đang tìm đối thủ' || selectedMatch.awayTeamName === 'Đội khách') && (
                <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FiMessageSquare /> Lời nhắn cho đội bạn (Tùy chọn)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Ví dụ: Đội mình có 7 người, muốn đá giao lưu vui vẻ..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                {(selectedMatch.matchStatus === 'LookingForOpponent' || selectedMatch.matchStatus === 'Scheduled') && (!selectedMatch.awayTeamName || selectedMatch.awayTeamName === 'Đang tìm đối thủ' || selectedMatch.awayTeamName === 'Đội khách') && (
                  <>
                    <button 
                      onClick={() => Swal.fire('Thông báo', 'Tính năng nhắn tin trực tiếp cho Đội trưởng đang được cập nhật!', 'info')}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <FiMessageSquare /> Nhắn tin
                    </button>
                    <button 
                      onClick={handleRequestToJoin}
                      disabled={isRequesting}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isRequesting ? 'Đang gửi...' : 'Bắt kèo ngay'}
                    </button>
                  </>
                )}
                <Link 
                  to={`/matches/${selectedMatch.matchId}`}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-md hover:-translate-y-0.5"
                >
                  Xem chi tiết
                </Link>
                <button 
                  onClick={() => { setSelectedMatch(null); setRequestMessage(''); }}
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
