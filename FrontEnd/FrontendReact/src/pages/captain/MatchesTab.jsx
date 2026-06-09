import React, { useState, useEffect } from 'react';
import { captainService } from '../../services/captainService';
import { FiCalendar, FiClock, FiMapPin, FiStar, FiCheck, FiX, FiPlus, FiMessageSquare } from 'react-icons/fi';
import MatchChatModal from './MatchChatModal';

export default function MatchesTab({ setActiveTab: setDashboardTab }) {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating Modal state
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingMatchId, setRatingMatchId] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Attendance Modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Chat Modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  // Create Challenge Modal state
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [newChallengeData, setNewChallengeData] = useState({ matchDate: '', startTime: '', location: '', notes: '' });

  // Stadium Rating Modal state
  const [showStadiumRateModal, setShowStadiumRateModal] = useState(false);
  const [ratingStadiumScore, setRatingStadiumScore] = useState(5);
  const [ratingStadiumComment, setRatingStadiumComment] = useState('');

  const openAttendanceModal = async (matchId) => {
    setShowAttendanceModal(true);
    setAttendanceLoading(true);
    setAttendanceData([]);
    try {
      const data = await captainService.getMatchAttendance(matchId);
      setAttendanceData(data?.attendance || data?.Attendance || data || []);
    } catch (err) {
      alert('Không thể lấy danh sách điểm danh');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const openChatModal = (id) => {
    setSelectedMatchId(id);
    setShowChatModal(true);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'matches') {
        const data = await captainService.getMatches();
        setMatches(data || []);
      } else if (activeTab === 'requests') {
        const data = await captainService.getMatchRequests();
        setRequests(data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      await captainService.createChallenge({
        matchDate: newChallengeData.matchDate,
        startTime: newChallengeData.startTime,
        location: newChallengeData.location,
        notes: newChallengeData.notes
      });
      setShowCreateChallengeModal(false);
      setNewChallengeData({ matchDate: '', startTime: '', location: '', notes: '' });
      if (window.confirm('Tạo kèo thành công! Bạn có muốn tìm và đặt sân luôn cho trận này không?')) {
        if (setDashboardTab) {
          setDashboardTab('stadiums');
        }
      } else {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi khi tạo yêu cầu giao hữu');
    }
  };

  const handleAcceptMatchRequest = async (id) => {
    try {
      await captainService.acceptMatchRequest(id);
      alert('Chấp nhận kèo thành công!');
      fetchData();
    } catch (err) {
      alert('Lỗi khi chấp nhận kèo: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleRejectMatchRequest = async (id) => {
    if (window.confirm('Bạn có chắc muốn từ chối kèo này?')) {
      try {
        await captainService.rejectMatchRequest(id);
        alert('Đã từ chối kèo!');
        fetchData();
      } catch (err) {
        alert('Lỗi khi từ chối kèo');
      }
    }
  };

  const handleCancelMatch = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy trận đấu này?')) {
      try {
        await captainService.cancelMatch(id, 'Captain requested cancellation');
        alert('Đã hủy trận đấu');
        fetchData();
      } catch (err) {
        alert('Lỗi khi hủy trận');
      }
    }
  };

  const handleMarkExternalPitch = async (id) => {
    if (window.confirm('Bạn xác nhận sẽ tự đặt sân ở ngoài cho trận này?')) {
      try {
        await captainService.markAsExternalPitch(id);
        alert('Cập nhật trạng thái tự đặt sân thành công!');
        fetchData();
      } catch (err) {
        alert('Lỗi khi cập nhật sân ngoài');
      }
    }
  };

  const openRateModal = (matchId) => {
    setRatingMatchId(matchId);
    setRatingScore(5);
    setRatingComment('');
    setShowRateModal(true);
  };

  const submitRating = async () => {
    try {
      await captainService.rateOpponent({
        MatchId: ratingMatchId,
        Score: ratingScore,
        Comment: ratingComment
      });
      alert('Đánh giá thành công!');
      setShowRateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đánh giá');
    }
  };

  const submitStadiumRating = () => {
    alert('Tính năng đánh giá sân bóng đang được phát triển!');
    setShowStadiumRateModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Trận Đấu & Kèo</h2>
      </div>
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'matches' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
        >
          Trận đấu của Đội
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
        >
          Kèo & Lời mời
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'timetable' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
        >
          Thời Gian Biểu (Timetable)
        </button>
      </div>

      {loading && <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Đang tải...</div>}
      {error && <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>}

      {!loading && !error && activeTab === 'matches' && (
        matches.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Đội của bạn hiện chưa có trận đấu nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match.matchId || match.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      match.matchStatus === 'Completed' ? 'bg-slate-100 text-slate-700 dark:text-slate-200' :
                      (match.matchStatus === 'Accepted' || match.matchStatus === 'ExternalBooked' || match.opponentName) ? 'bg-emerald-100 text-emerald-700' :
                      match.matchStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                      match.matchStatus === 'LookingForOpponent' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {match.matchStatus === 'Completed' ? 'Đã kết thúc' : 
                       match.matchStatus === 'Cancelled' ? 'Đã hủy' :
                       match.matchStatus === 'ExternalBooked' ? 'Đã đặt sân ngoài' :
                       match.matchStatus === 'Accepted' ? 'Đã chốt kèo' : 
                       match.matchStatus === 'LookingForOpponent' ? 'Đang tìm đối' : 
                       match.matchStatus === 'Scheduled' ? 'Đã lên lịch' :
                       match.opponentName ? 'Đã chốt kèo / Sắp đá' :
                       (match.matchStatus || 'Đã lên lịch')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đối thủ</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.opponentName || 'Chưa có đối thủ'}</p>
                  </div>
                </div>
                
                {match.matchStatus === 'Completed' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Trận đấu đã kết thúc</p>
                    <div className="flex gap-2">
                      <button onClick={() => openRateModal(match.matchId || match.id)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 font-semibold transition-colors">
                        <FiStar /> Đánh giá đối thủ
                      </button>
                      <button onClick={() => setShowStadiumRateModal(true)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-semibold transition-colors">
                        <FiStar /> Đánh giá sân bóng
                      </button>
                    </div>
                  </div>
                )}
                {match.matchStatus === 'Accepted' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Chưa có sân thi đấu. Bạn muốn:</p>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        localStorage.setItem('bookingMatchId', match.matchId || match.id);
                        if (setDashboardTab) setDashboardTab('stadiums');
                      }} className="flex-1 text-xs bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 font-semibold transition-colors text-center">
                        Đặt sân trên hệ thống
                      </button>
                      <button onClick={() => handleMarkExternalPitch(match.matchId || match.id)} className="flex-1 text-xs bg-slate-100 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-200 font-semibold transition-colors text-center">
                        Đã tự đặt sân ngoài
                      </button>
                    </div>
                  </div>
                )}
                {match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && match.opponentName && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <button onClick={() => openChatModal(match.matchId || match.id)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors flex items-center gap-1">
                      <FiMessageSquare /> Chat 2 Đội
                    </button>
                  </div>
                )}
                {match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <button onClick={() => openAttendanceModal(match.matchId || match.id)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors">
                      Xem Điểm Danh
                    </button>
                    <button onClick={() => handleCancelMatch(match.matchId || match.id)} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold transition-colors">
                      Hủy trận
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {!loading && !error && activeTab === 'requests' && (
        requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">Hiện tại không có kèo giao hữu nào đang chờ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div key={req.requestId} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {req.team.logoUrl ? (
                      <img src={req.team.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                        {req.team.teamName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-white">{req.team.teamName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><FiCalendar className="inline" /> {new Date(req.matchDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
                {req.message && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-600 dark:text-slate-400 italic">
                    "{req.message}"
                  </div>
                )}
                <div className="mt-4 flex gap-2 w-full">
                  <button onClick={() => handleAcceptMatchRequest(req.requestId)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md shadow-emerald-500/20">
                    <FiCheck /> Nhận kèo
                  </button>
                  <button onClick={() => handleRejectMatchRequest(req.requestId)} className="flex items-center justify-center gap-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 px-4 py-2 rounded-lg font-semibold transition-colors">
                    <FiX /> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && !error && activeTab === 'timetable' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FiCalendar className="text-blue-500" /> Thời gian biểu
          </h3>
          {matches.filter(m => m.matchStatus !== 'Cancelled').length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">Chưa có lịch thi đấu.</p>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {matches
                .filter(m => m.matchStatus !== 'Cancelled' && m.matchStatus !== 'LookingForOpponent')
                .sort((a, b) => new Date(a.scheduleStartTime || Date.now()) - new Date(b.scheduleStartTime || Date.now()))
                .map((match, idx) => (
                  <div key={match.matchId || match.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-blue-500 text-slate-500 dark:text-slate-400 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <FiClock size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-800 dark:text-white">
                          {match.opponentName || 'Chưa có đối thủ'}
                        </div>
                        <time className="font-caveat font-medium text-blue-500 text-sm">
                          {match.scheduleStartTime ? new Date(match.scheduleStartTime).toLocaleDateString('vi-VN') : 'Sắp xếp'}
                        </time>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">
                        {match.scheduleStartTime ? new Date(match.scheduleStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có giờ'}
                        {match.matchStatus === 'Completed' ? ' - Đã kết thúc' : 
                         match.matchStatus === 'ExternalBooked' ? ' - Đã đặt sân ngoài' : 
                         match.matchStatus === 'Accepted' ? ' - Đã chốt kèo' : 
                         ' - Sắp diễn ra'}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Danh sách Điểm Danh</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {attendanceLoading ? (
                <div className="text-center text-slate-500 dark:text-slate-400">Đang tải danh sách...</div>
              ) : attendanceData.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400">Chưa có ai điểm danh.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl mb-4 font-bold text-slate-700 dark:text-slate-200">
                    <span>Tổng: {attendanceData.length} người</span>
                    <span className="text-emerald-600">ĐI: {attendanceData.filter(a => a.isAttending).length}</span>
                    <span className="text-rose-600">NGHỈ: {attendanceData.filter(a => !a.isAttending).length}</span>
                  </div>
                  {attendanceData.map((att, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-2">
                      <span className="font-medium text-slate-800 dark:text-white">{att.playerName || `Player ID: ${att.playerId}`}</span>
                      {att.matchStatus === 'Cancelled' ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200">Hủy trận</span>
                      ) : att.isAttending ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Sẽ tham gia</span>
                      ) : att.isAttending === false ? (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Báo vắng</span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Chưa vote</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Đánh giá Đối thủ</h3>
              <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Thái độ & Trình độ (Sao)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      <FiStar className={star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {ratingScore === 5 && 'Tuyệt vời, Fair play'}
                  {ratingScore === 4 && 'Tốt, đá đẹp'}
                  {ratingScore === 3 && 'Bình thường'}
                  {ratingScore === 2 && 'Đá rắn, có tiểu xảo'}
                  {ratingScore === 1 && 'Tệ, không fair play'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nhận xét thêm (Không bắt buộc)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-shadow text-sm"
                  rows="3"
                  placeholder="Nhập nhận xét của bạn về đối thủ..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                ></textarea>
              </div>
              <button
                onClick={submitRating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
              >
                Gửi Đánh Giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STADIUM RATING MODAL */}
      {showStadiumRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Đánh giá Sân Bóng</h3>
              <button onClick={() => setShowStadiumRateModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Chất lượng sân (Sao)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStadiumScore(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      <FiStar className={star <= ratingStadiumScore ? 'fill-blue-400 text-blue-400' : 'text-slate-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Nhận xét thêm</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-shadow text-sm"
                  rows="3"
                  placeholder="Nhập nhận xét về sân bóng..."
                  value={ratingStadiumComment}
                  onChange={(e) => setRatingStadiumComment(e.target.value)}
                ></textarea>
              </div>
              <button
                onClick={submitStadiumRating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
              >
                Gửi Đánh Giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {showChatModal && selectedMatchId && (
        <MatchChatModal
          matchId={selectedMatchId}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* CREATE CHALLENGE MODAL */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tạo Kèo Giao Hữu Mới</h3>
              <button onClick={() => setShowCreateChallengeModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateChallenge} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Ngày dự kiến</label>
                  <input 
                    type="date" 
                    required 
                    value={newChallengeData.matchDate}
                    onChange={e => setNewChallengeData({...newChallengeData, matchDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Giờ dự kiến</label>
                  <input 
                    type="time" 
                    required 
                    value={newChallengeData.startTime}
                    onChange={e => setNewChallengeData({...newChallengeData, startTime: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Địa bàn hoạt động (Khu vực)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="VD: Quận Cầu Giấy, Sân X..."
                  value={newChallengeData.location}
                  onChange={e => setNewChallengeData({...newChallengeData, location: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Ghi chú thêm</label>
                <textarea 
                  rows="3" 
                  placeholder="Yêu cầu trình độ, trang phục, chia tiền sân..."
                  value={newChallengeData.notes}
                  onChange={e => setNewChallengeData({...newChallengeData, notes: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 mt-2"
              >
                Đăng Kèo Ngay
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
