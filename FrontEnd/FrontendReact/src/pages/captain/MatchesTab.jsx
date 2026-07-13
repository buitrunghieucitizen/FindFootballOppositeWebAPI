import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchesGuideModal from './MatchesGuideModal';
import { captainService } from '../../services/captainService';
import { directMessageService } from '../../services/directMessageService';
import playerService from '../../services/playerService';
import { publicService } from '../../services/publicService';
import Swal from 'sweetalert2';
import { FiCalendar, FiClock, FiMapPin, FiStar, FiCheck, FiX, FiPlus, FiMessageSquare, FiInfo, FiUsers, FiMessageCircle, FiCheckSquare, FiCheckCircle } from 'react-icons/fi';
import MatchChatModal from './MatchChatModal';
import InviteTeamModal from './InviteTeamModal';
import LocationDisplay from '../../components/LocationDisplay';
import ScoreModal from '../../components/ScoreModal';

export default function MatchesTab({ setActiveTab: setDashboardTab }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const guideMessages = [
    "👉 Bước 1: Hãy bấm vào tab 'Kèo & Lời mời' ở phía trên màn hình.",
    "👉 Bước 2: Bấm vào nút 'Tạo kèo giao hữu mới' màu xanh.",
    "👉 Bước 3: Điền đầy đủ thông tin vào Cửa sổ vừa mở và bấm 'Đăng Kèo Ngay' để hoàn tất!"
  ];

  // Rating state - Removed as it's extracted to RateMatch_Captain.jsx


  // Attendance Modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Chat Modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  // Invite Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMatchId, setInviteMatchId] = useState(null);

  // Create Challenge logic was extracted to CreateChallenge_Captain.jsx

  // Stadium Rating Modal state
  const [showStadiumRateModal, setShowStadiumRateModal] = useState(false);
  const [ratingStadiumScore, setRatingStadiumScore] = useState(5);
  const [ratingStadiumComment, setRatingStadiumComment] = useState('');

  // Score Modal state
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreMatch, setScoreMatch] = useState(null);
  const [scoreData, setScoreData] = useState({ homeScore: 0, awayScore: 0, setScores: '' });

  // Edit Match logic was extracted to EditMatch_Captain.jsx

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

  // Team info for fallback
  const [myTeamId, setMyTeamId] = useState(null);
  const [teamData, setTeamData] = useState(null);

  const getOpponentName = (match) => {
    if (match.opponentName) return match.opponentName;
    if (match.OpponentName) return match.OpponentName;
    if (match.homeTeam && match.awayTeam) {
      if (myTeamId && match.homeTeamId === myTeamId) return match.awayTeam.teamName || match.awayTeam.TeamName;
      if (myTeamId && match.awayTeamId === myTeamId) return match.homeTeam.teamName || match.homeTeam.TeamName;
      return match.awayTeam.teamName || match.awayTeam.TeamName || 'Đối thủ';
    }
    if (match.homeTeam && !match.awayTeam && myTeamId && match.homeTeamId !== myTeamId) return match.homeTeam.teamName || match.homeTeam.TeamName;
    if (match.awayTeam && !match.homeTeam && myTeamId && match.awayTeamId !== myTeamId) return match.awayTeam.teamName || match.awayTeam.TeamName;
    return null;
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const [selectedRequestInfo, setSelectedRequestInfo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (!myTeamId) {
        try {
          const team = await captainService.getMyTeam();
          if (team) {
            setMyTeamId(team.teamId || team.id);
            setTeamData(team);
          }
        } catch(e) {}
      }
      if (activeTab === 'matches') {
        const data = await captainService.getMatches();
        setMatches(data || []);
      } else if (activeTab === 'requests') {
        const [reqData, inviteData] = await Promise.all([
          captainService.getMatchRequests(),
          captainService.getReceivedInvites()
        ]);
        setRequests(reqData || []);
        setInvites(inviteData || []);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // handleCreateChallenge was extracted to CreateChallenge_Captain.jsx

  const handleVote = async (matchId, isAttending) => {
    try {
      await playerService.voteAttendance(matchId, isAttending);
      Swal.fire('Thành công', 'Điểm danh thành công!', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleAcceptMatchRequest = async (id) => {
    try {
      await captainService.acceptMatchRequest(id);
      Swal.fire('Thành công', 'Chấp nhận kèo thành công!', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Lỗi', 'Lỗi khi chấp nhận kèo: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleRejectMatchRequest = async (id) => {
    const confirm = await Swal.fire({
      title: 'Từ chối kèo?',
      text: 'Bạn có chắc muốn từ chối yêu cầu giao hữu này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Từ chối',
      cancelButtonText: 'Đóng'
    });
    if (confirm.isConfirmed) {
      try {
        await captainService.rejectMatchRequest(id);
        Swal.fire('Thành công', 'Đã từ chối kèo!', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Lỗi', 'Lỗi khi từ chối kèo', 'error');
      }
    }
  };

  const handleCancelMatch = async (id) => {
    const { value: reason } = await Swal.fire({
      title: 'Hủy trận đấu',
      input: 'textarea',
      inputPlaceholder: 'Nhập lý do hủy trận...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận Hủy',
      cancelButtonText: 'Đóng',
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập lý do hủy!'
        }
      }
    });

    if (reason) {
      try {
        await captainService.cancelMatch(id, reason);
        Swal.fire('Thành công', 'Đã hủy trận đấu', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Lỗi', 'Lỗi khi hủy trận: ' + (err.response?.data?.message || err.message), 'error');
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

  const handleMessageOpponent = async (captainId, teamName) => {
    if (!captainId) {
      Swal.fire('Lỗi', 'Không tìm thấy thông tin đội trưởng của đội này', 'error');
      return;
    }
    const { value: text } = await Swal.fire({
      title: `Nhắn tin cho ${teamName}`,
      input: 'textarea',
      inputPlaceholder: 'Nhập tin nhắn của bạn...',
      showCancelButton: true,
      confirmButtonText: 'Gửi tin nhắn',
      cancelButtonText: 'Hủy'
    });

    if (text) {
      try {
        await directMessageService.sendMessage(captainId, text);
        Swal.fire('Thành công', 'Tin nhắn đã được gửi. Bạn có thể kiểm tra trong mục Tin Nhắn.', 'success');
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể gửi tin nhắn', 'error');
      }
    }
  };

  const openRateModal = (match) => {
    navigate(`/captain/matches/${match.matchId || match.id}/rate`);
  };

  const submitStadiumRating = () => {
    alert('Tính năng đánh giá sân bóng đang được phát triển!');
    setShowStadiumRateModal(false);
  };

  const openScoreModal = (match) => {
    setScoreMatch(match);
    setShowScoreModal(true);
  };

  const submitScore = async (data) => {
    try {
      await captainService.updateScore(scoreMatch.matchId || scoreMatch.id, data);
      Swal.fire('Thành công', 'Đã lưu tỉ số. Vui lòng chờ đối thủ xác nhận!', 'success');
      setShowScoreModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleConfirmResult = async (matchId) => {
    try {
      await captainService.confirmResult(matchId);
      Swal.fire('Thành công', 'Đã xác nhận kết quả!', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Lỗi', 'Lỗi khi xác nhận kết quả: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const openEditMatchModal = (match) => {
    navigate(`/captain/matches/${match.matchId || match.id}/edit`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <MatchesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      
      {/* CUSTOM INTERACTIVE GUIDE BANNER */}
      {runTour && (
        <div className="fixed bottom-8 right-8 z-[9999] w-80 bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 flex flex-col gap-3 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <FiInfo className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-1">Cẩm nang tương tác</h4>
              <p className="font-semibold text-sm leading-relaxed text-slate-700 dark:text-slate-200">{guideMessages[stepIndex]}</p>
            </div>
            <button 
              onClick={() => {
                setRunTour(false);
                setStepIndex(0);
              }} 
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 shrink-0 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              title="Đóng hướng dẫn"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Trận Đấu & Kèo</h2>
        <button onClick={() => {
          setRunTour(true);
          setStepIndex(0);
        }} className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors font-semibold">
          <FiCheckSquare /> Chạy Hướng dẫn Tương tác
        </button>
      </div>
      <div className="tour-step-match-tabs flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => {
            setActiveTab('matches');
            if (runTour && stepIndex === 2) setStepIndex(3);
          }}
          className={`tour-step-matches-tab pb-3 px-2 font-medium transition-colors ${activeTab === 'matches' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
        >
          Trận đấu của Đội
        </button>
        <button
          onClick={() => {
            setActiveTab('requests');
            if (runTour && stepIndex === 0) setStepIndex(1);
          }}
          className={`tour-step-requests-tab pb-3 px-2 font-medium transition-colors ${activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
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
        <div className="space-y-4">
          <button 
            onClick={() => {
              navigate('/captain/matches/create');
              if (runTour && stepIndex === 1) {
                setTimeout(() => setStepIndex(2), 300);
              }
            }}
            className="tour-step-create-challenge flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
          >
            <FiPlus /> Tạo kèo giao hữu mới
          </button>
          {matches.length === 0 ? (
            <div className="tour-step-match-item bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Đội của bạn hiện chưa có trận đấu nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, idx) => (
              <div key={match.matchId || match.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow ${idx === 0 ? 'tour-step-match-item' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      match.matchStatus === 'PendingConfirmation' ? 'bg-purple-100 text-purple-700' :
                      match.matchStatus === 'Completed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                      (match.matchStatus === 'Accepted' || match.matchStatus === 'ExternalBooked' || getOpponentName(match)) ? 'bg-emerald-100 text-emerald-700' :
                      match.matchStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                      match.matchStatus === 'LookingForOpponent' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {match.matchStatus === 'PendingConfirmation' ? 'Đang xác nhận' :
                       match.matchStatus === 'Completed' ? 'Đã kết thúc' : 
                       match.matchStatus === 'Cancelled' ? 'Đã hủy' :
                       match.matchStatus === 'ExternalBooked' ? 'Đã đặt sân ngoài' :
                       match.matchStatus === 'Accepted' ? 'Đã chốt kèo' : 
                       match.matchStatus === 'LookingForOpponent' ? 'Đang tìm đối thủ' : 
                       match.matchStatus === 'Scheduled' ? 'Đã lên lịch' :
                       getOpponentName(match) ? 'Đã chốt kèo / Sắp đá' :
                       (match.matchStatus === 'Ongoing' ? 'Đang diễn ra' : 'Đã lên lịch')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đối thủ</p>
                    <p className="font-bold text-slate-800 dark:text-white">{getOpponentName(match) || 'Chưa có đối thủ'}</p>
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-1.5">
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <FiCalendar className="text-emerald-600" /> 
                    {match.matchDate ? new Date(match.matchDate).toLocaleDateString('vi-VN') : 'Chưa xếp lịch'} 
                    {match.startTime && ` - ${match.startTime.substring(0,5)}`}
                  </p>
                  <div className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <FiMapPin className="text-emerald-600 shrink-0 mt-0.5" /> 
                    <LocationDisplay location={match.location} />
                  </div>
                </div>
                
                {match.matchStatus === 'Completed' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Đã kết thúc</p>
                      <div className="flex flex-col items-end">
                        <p className="text-xl font-black text-slate-800 dark:text-white tracking-widest">{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
                        {match.setScores && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">({match.setScores})</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openRateModal(match)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 font-semibold transition-colors">
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
                {match.matchStatus === 'LookingForOpponent' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
                     <button 
                       onClick={() => {
                         setInviteMatchId(match.matchId || match.id);
                         setShowInviteModal(true);
                       }} 
                       className="flex items-center gap-1.5 text-xs bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 font-semibold transition-colors"
                     >
                       <FiUsers size={14} /> Mời đối thủ
                     </button>
                  </div>
                )}
                {match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && getOpponentName(match) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
                    {(() => {
                      const isHome = myTeamId && (match.homeTeamId === myTeamId || match.HomeTeamId === myTeamId);
                      const isAway = myTeamId && (match.awayTeamId === myTeamId || match.AwayTeamId === myTeamId);
                      const hasHomeConfirmed = match.homeConfirmed || match.HomeConfirmed;
                      const hasAwayConfirmed = match.awayConfirmed || match.AwayConfirmed;

                      if (hasHomeConfirmed && !hasAwayConfirmed) {
                        if (isHome) return <div className="text-sm font-medium text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-900/30 py-2 rounded-lg">Đang chờ đối thủ xác nhận tỉ số {match.homeScore} - {match.awayScore}</div>;
                        if (isAway) return (
                          <div className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 text-center mb-1">Đối thủ báo tỉ số: <span className="font-bold text-lg">{match.homeScore} - {match.awayScore}</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleConfirmResult(match.matchId || match.id)} className="flex-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600">Xác nhận đúng</button>
                              <button onClick={() => openScoreModal(match.matchId || match.id)} className="flex-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-rose-600">Báo sai / Nhập lại</button>
                            </div>
                          </div>
                        );
                      }
                      if (!hasHomeConfirmed && hasAwayConfirmed) {
                        if (isAway) return <div className="text-sm font-medium text-amber-600 dark:text-amber-400 text-center bg-amber-50 dark:bg-amber-900/30 py-2 rounded-lg">Đang chờ đối thủ xác nhận tỉ số {match.homeScore} - {match.awayScore}</div>;
                        if (isHome) return (
                          <div className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 text-center mb-1">Đối thủ báo tỉ số: <span className="font-bold text-lg">{match.homeScore} - {match.awayScore}</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleConfirmResult(match.matchId || match.id)} className="flex-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600">Xác nhận đúng</button>
                              <button onClick={() => openScoreModal(match)} className="flex-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-rose-600">Báo sai / Nhập lại</button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button onClick={() => openScoreModal(match)} className="w-full text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 font-bold transition-colors text-center border border-blue-100">
                          Hoàn thành trận đấu
                        </button>
                      );
                    })()}
                  </div>
                )}
                {match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && getOpponentName(match) && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <button onClick={() => openChatModal(match.matchId || match.id)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors flex items-center gap-1">
                      <FiMessageSquare /> Chat 2 Đội
                    </button>
                    {(myTeamId && (match.homeTeamId === myTeamId || match.HomeTeamId === myTeamId)) && (
                      <button onClick={() => openEditMatchModal(match)} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100 font-semibold transition-colors flex items-center gap-1">
                        Chỉnh sửa trận đấu
                      </button>
                    )}
                  </div>
                )}
                {match.matchStatus !== 'Completed' && match.matchStatus !== 'Cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-bold text-slate-500">Điểm danh của bạn:</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVote(match.matchId || match.id, true)} 
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${(match.myVote === true || match.MyVote === true) ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                        >
                          {(match.myVote === true || match.MyVote === true) ? 'ĐÃ ĐIỂM DANH' : 'ĐI'}
                        </button>
                        <button 
                          onClick={() => handleVote(match.matchId || match.id, false)} 
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${(match.myVote === false || match.MyVote === false) ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                        >
                          {(match.myVote === false || match.MyVote === false) ? 'ĐÃ BÁO VẮNG' : 'NGHỈ'}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button onClick={() => openAttendanceModal(match.matchId || match.id)} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-semibold transition-colors">
                        Xem Điểm Danh Đội
                      </button>
                      <button onClick={() => handleCancelMatch(match.matchId || match.id)} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold transition-colors">
                        Hủy trận
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 && invites.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400">Hiện tại không có kèo giao hữu nào đang chờ.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {requests.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiUsers className="text-indigo-500" />
                    Có {requests.length} đội xin đá giao hữu với bạn:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map((req) => (
                      <div key={req.requestId} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {req.team?.logoUrl ? (
                              <img src={req.team.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                {req.team?.teamName?.charAt(0) || '?'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-lg text-slate-800 dark:text-white">{req.team?.teamName || 'Đội khách'}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><FiCalendar className="inline" /> {req.matchDate ? new Date(req.matchDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</p>
                            </div>
                          </div>
                        </div>
                        {req.message && (
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-800">
                            "{req.message}"
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2 w-full">
                          <button onClick={() => setSelectedRequestInfo(req.team)} className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors text-sm">
                            <FiUsers /> Xem Info
                          </button>
                          <button onClick={() => handleMessageOpponent(req.team?.captainId, req.team?.teamName)} className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg font-semibold transition-colors text-sm">
                            <FiMessageCircle /> Nhắn tin
                          </button>
                        </div>
                        <div className="mt-2 flex gap-2 w-full">
                          <button onClick={() => handleAcceptMatchRequest(req.requestId)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md shadow-emerald-500/20 text-sm">
                            <FiCheck /> Nhận kèo
                          </button>
                          <button onClick={() => handleRejectMatchRequest(req.requestId)} className="flex items-center justify-center gap-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
                            <FiX /> Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {invites.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiStar className="text-amber-500" />
                    Có {invites.length} lời mời đội bạn tham gia giao hữu:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {invites.map((inv) => (
                      <div key={inv.requestId} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-3">
                            {inv.homeTeamAvatar ? (
                              <img src={inv.homeTeamAvatar} alt="Logo" className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-800 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                                {inv.homeTeamName?.charAt(0) || '?'}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-lg text-indigo-900 dark:text-indigo-100">{inv.homeTeamName || 'Đội nhà'}</p>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Lời mời</span>
                              </div>
                              <div className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-1 flex flex-col gap-0.5">
                                <span className="flex items-center gap-1"><FiCalendar className="inline" /> {inv.matchDate ? new Date(inv.matchDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'} {inv.startTime ? `(${inv.startTime})` : ''}</span>
                                <span className="flex items-center gap-1"><FiMapPin className="inline" /> {inv.location || 'Chưa cập nhật sân'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {inv.message && (
                          <div className="mt-4 p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg text-sm text-indigo-800 dark:text-indigo-300 italic border border-white/40 dark:border-slate-700/40 relative z-10 shadow-inner">
                            "{inv.message}"
                          </div>
                        )}
                        <div className="mt-4 flex gap-2 w-full relative z-10">
                          <button onClick={() => handleAcceptMatchRequest(inv.requestId)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/30 text-sm hover:-translate-y-0.5">
                            <FiCheckCircle /> Tham gia ngay
                          </button>
                          <button onClick={() => handleRejectMatchRequest(inv.requestId)} className="flex items-center justify-center gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-semibold transition-all border border-slate-200 dark:border-slate-700 text-sm">
                            <FiX /> Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
                          {getOpponentName(match) || 'Chưa có đối thủ'}
                        </div>
                        <time className="font-caveat font-medium text-blue-500 text-sm">
                          {match.scheduleStartTime ? new Date(match.scheduleStartTime).toLocaleDateString('vi-VN') : 'Sắp xếp'}
                        </time>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm">
                        {match.scheduleStartTime ? new Date(match.scheduleStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có giờ'}
                        {match.matchStatus === 'PendingConfirmation' ? ' - Đang xác nhận' :
                         match.matchStatus === 'Completed' ? ' - Đã kết thúc' : 
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-white">{att.playerName || `Player ID: ${att.playerId}`}</span>
                        {att.isGuest && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Khách</span>
                        )}
                      </div>
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

      {/* RATING MODAL WAS EXTRACTED TO SEPARATE PAGE */}

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

      {/* SCORE MODAL */}
      <ScoreModal 
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        match={scoreMatch}
        onSubmit={submitScore}
        isSetFormat={teamData?.scoringFormat === 'Sets'}
        homeName={scoreMatch?.homeTeamName || 'Đội Nhà'}
        awayName={scoreMatch?.awayTeamName || 'Đội Khách'}
      />

      {/* EDIT MATCH MODAL WAS EXTRACTED */}


      {/* CHAT MODAL */}
      {showChatModal && selectedMatchId && (
        <MatchChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        matchId={selectedMatchId}
      />
      )}
      
      <InviteTeamModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        matchId={inviteMatchId}
        onInviteSuccess={fetchData}
      />

      {/* CREATE CHALLENGE MODAL WAS EXTRACTED */}

      {/* VIEW OPPONENT INFO MODAL */}
      {selectedRequestInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông tin Đội bóng</h3>
              <button onClick={() => setSelectedRequestInfo(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm"><FiX size={20} /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              {selectedRequestInfo.logoUrl ? (
                <img src={selectedRequestInfo.logoUrl} alt="Logo" className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-md mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-3xl mb-4 shadow-md">
                  {selectedRequestInfo.teamName.charAt(0)}
                </div>
              )}
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{selectedRequestInfo.teamName}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{selectedRequestInfo.homeArea || 'Chưa cập nhật khu vực'}</p>

              <div className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Trình độ:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRequestInfo.qualityLevel || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số thành viên:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRequestInfo.memberCount || 15} người</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tỉ lệ thắng:</span>
                  <span className="font-semibold text-emerald-600">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm Fairplay:</span>
                  <span className="font-semibold text-amber-500">{selectedRequestInfo.fairplayScore ?? 100} điểm</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-2 font-medium">Feedback gần đây:</span>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="italic text-slate-600 dark:text-slate-400 text-xs leading-relaxed">"Đội đá nhiệt tình, rất fairplay và đúng giờ. Nên giao lưu lại!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
