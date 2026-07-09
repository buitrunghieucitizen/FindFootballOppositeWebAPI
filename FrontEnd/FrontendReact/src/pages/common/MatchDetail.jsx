import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { captainService } from '../../services/captainService';
import { PublicHeader } from '../../components/portal-ui';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiAward, FiMessageCircle, FiMessageSquare } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const handleRequestToJoin = async () => {
    if (!localStorage.getItem('token')) {
      Swal.fire('Cảnh báo', 'Bạn cần đăng nhập với vai trò Đội Trưởng để thực hiện chức năng này.', 'warning');
      return;
    }
    
    // Check rank warning
    try {
      const warningRes = await captainService.checkMatchRank(id);
      if (warningRes && warningRes.requiresWarning) {
        const confirm = await Swal.fire({
          title: 'Cảnh báo chênh lệch trình độ!',
          html: `<p>Đội của bạn và đối thủ có sự chênh lệch lớn về trình độ:</p>
                 <p class="text-rose-600 font-bold mt-2">${warningRes.message}</p>
                 <p class="mt-2">Bạn có chắc chắn muốn tiếp tục bắt kèo?</p>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Vẫn Bắt kèo',
          cancelButtonText: 'Hủy'
        });
        if (!confirm.isConfirmed) return;
      }
    } catch (err) {
      console.warn("Lỗi check rank", err);
    }

    try {
      setIsRequesting(true);
      await captainService.requestToJoinMatch(id, { message: requestMessage });
      Swal.fire('Thành công!', 'Yêu cầu của bạn đã được gửi tới Đội chủ nhà. Vui lòng chờ họ xác nhận.', 'success');
      fetchMatchDetail(); // Refresh
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Không thể gửi yêu cầu', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    // Tạm thời fetch data từ danh sách public matches rồi filter
    // Tương lai cần API getMatchById
    fetchMatchDetail();
  }, [id]);

  const fetchMatchDetail = async () => {
    try {
      setLoading(true);
      const data = await publicService.getMatches();
      if (!Array.isArray(data)) {
        setError('Dữ liệu không hợp lệ');
        return;
      }
      const currentMatch = data.find(m => m.matchId === Number(id));
      if (currentMatch) {
        setMatch(currentMatch);
      } else {
        setError('Không tìm thấy trận đấu');
      }
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Lỗi khi tải dữ liệu trận đấu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-xl font-bold text-emerald-600 animate-pulse">Đang tải...</div></div>;
  if (error || !match) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-red-500 font-bold">{error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 animate-fade-in">
        <Link to="/matches" className="text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-block">
          &larr; Quay lại danh sách
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-sm font-bold tracking-widest uppercase mb-4 relative z-10">
              {match.matchType || 'Giao Hữu'}
            </span>
            <div className="flex justify-center items-center gap-4 sm:gap-8 relative z-10">
              <div className="text-right flex-1">
                {match.homeTeamId ? (
                  <Link to={`/teams/${match.homeTeamId}`} className="hover:text-emerald-300 transition-colors">
                    <h3 className="text-2xl sm:text-4xl font-black">{match.homeTeamName || 'Đội nhà'}</h3>
                  </Link>
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black">{match.homeTeamName || 'Đội nhà'}</h3>
                )}
              </div>
              <div className="text-center shrink-0">
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-slate-700">
                  <span className="text-3xl sm:text-5xl font-black tracking-widest">
                    {match.matchStatus === 'Completed' ? `${match.homeScore || 0} - ${match.awayScore || 0}` : 'VS'}
                  </span>
                </div>
              </div>
              <div className="text-left flex-1">
                {match.awayTeamId ? (
                  <Link to={`/teams/${match.awayTeamId}`} className="hover:text-emerald-300 transition-colors">
                    <h3 className="text-2xl sm:text-4xl font-black">{match.awayTeamName || 'Đang chờ...'}</h3>
                  </Link>
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black">{match.awayTeamName || 'Đang chờ...'}</h3>
                )}
              </div>
            </div>
            <div className="mt-6 inline-block px-4 py-1.5 rounded-full bg-white text-slate-900 text-sm font-bold uppercase relative z-10">
              {match.matchStatus === 'Cancelled' ? 'Đã Hủy' : match.matchStatus === 'Completed' ? 'Đã Kết Thúc' : 'Sắp Diễn Ra'}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin trận đấu</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Thời gian</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.kickoffLabel || 'Chưa xếp lịch'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FiMapPin />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sân vận động</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.venueLabel || 'Chưa chốt sân'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FiAward />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Trạng thái sân</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.bookingSummary || 'Chưa rõ'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin bên lề</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <FiUsers />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tình hình lực lượng</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.attendanceSummary || 'Chưa có thông tin điểm danh'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <FiMessageCircle />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Quy định hủy kèo</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.cancelFlowSummary || 'Tuân thủ quy định hệ thống'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            {(match.matchStatus === 'LookingForOpponent' || match.matchStatus?.toLowerCase() === 'lookingforopponent' || match.awayTeamName === 'Đang tìm đối thủ' || !match.awayTeamName) && match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && (
              <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-8">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Gửi yêu cầu Gạ đối / Bắt kèo</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FiMessageSquare /> Lời nhắn cho đội nhà (Tùy chọn)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Ví dụ: Đội mình có 7 người, muốn đá giao lưu vui vẻ..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 min-h-[100px] mb-4"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => Swal.fire('Thông báo', 'Tính năng nhắn tin trực tiếp cho Đội trưởng đang được cập nhật!', 'info')}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <FiMessageSquare /> Nhắn tin
                    </button>
                    <button 
                      onClick={handleRequestToJoin}
                      disabled={isRequesting}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isRequesting ? 'Đang gửi...' : 'Bắt kèo ngay'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Additional details could go here like Timeline, Events, etc. */}
            <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tính năng Bình luận trận đấu và Tường thuật trực tiếp đang được phát triển.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
