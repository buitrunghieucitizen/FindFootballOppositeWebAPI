import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiCheck, FiUsers, FiAward, FiCalendar, FiSend, FiCheckCircle } from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { publicService } from '../../services/publicService';
import Swal from 'sweetalert2';

/* ── colour palette for avatar circles ── */
const AVATAR_COLORS = [
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-fuchsia-500 to-pink-500',
  'from-indigo-500 to-blue-500',
  'from-lime-500 to-green-500',
];

const STAR_LABELS = {
  1: 'Tệ, không fair play',
  2: 'Đá rắn, có tiểu xảo',
  3: 'Bình thường',
  4: 'Tốt, đá đẹp',
  5: 'Tuyệt vời, Fair play',
};

const STAR_COLORS = {
  1: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  2: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  4: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  5: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
};

export default function RateMatch_Captain() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  
  // Rating States
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [opponentMembers, setOpponentMembers] = useState([]);
  const [playerRatings, setPlayerRatings] = useState({});

  useEffect(() => {
    fetchMatchAndOpponent();
  }, [id]);

  const fetchMatchAndOpponent = async () => {
    try {
      setLoading(true);
      // Fetch match details. We can use getMatches from captainService and filter, or a specific endpoint if exists.
      // Since captainService.getMatches() returns all matches, let's just fetch all and find the one.
      const matches = await captainService.getMatches();
      const match = matches.find(m => (m.matchId === parseInt(id) || m.id === parseInt(id)));
      
      if (!match) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không tìm thấy trận đấu.', confirmButtonColor: '#6366f1' });
        navigate('/captain-home?tab=matches');
        return;
      }
      
      setMatchData(match);

      // Find myTeamId from localStorage or by calling getMyTeam
      const myTeam = await captainService.getMyTeam();
      const myTeamId = myTeam?.teamId || myTeam?.TeamId;

      let targetTeamId = null;
      if (myTeamId) {
        targetTeamId = (match.homeTeamId === myTeamId || match.HomeTeamId === myTeamId) 
                       ? (match.awayTeamId || match.AwayTeamId) 
                       : (match.homeTeamId || match.HomeTeamId);
      }
      
      if (targetTeamId) {
        const teamData = await publicService.getTeam(targetTeamId);
        if (teamData && teamData.members) {
          setOpponentMembers(teamData.members.filter(m => m.role !== 'Owner'));
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi khi tải dữ liệu trận đấu', confirmButtonColor: '#6366f1' });
    } finally {
      setLoading(false);
    }
  };

  const submitTeamRating = async () => {
    try {
      await captainService.rateOpponent({
        MatchId: parseInt(id),
        Score: ratingScore,
        Comment: ratingComment
      });
      Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đánh giá đội đối thủ thành công!', confirmButtonColor: '#6366f1' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Lỗi khi đánh giá đội', confirmButtonColor: '#6366f1' });
    }
  };

  const handleRateOpponentPlayer = async (playerId) => {
    const ratingData = playerRatings[playerId] || { score: 5, comment: '' };
    try {
      await captainService.rateOpponentPlayer(playerId, {
        score: ratingData.score || 5,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        comment: ratingData.comment || ''
      });
      Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đánh giá cầu thủ thành công!', confirmButtonColor: '#6366f1' });
      setPlayerRatings(prev => ({ ...prev, [playerId]: { ...prev[playerId], rated: true } }));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Lỗi khi đánh giá cầu thủ', confirmButtonColor: '#6366f1' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-wc-navy-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-wc-navy-900 dark:via-slate-900 dark:to-wc-navy-900">

      {/* ───── Gradient Hero Header ───── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-800 dark:via-violet-800 dark:to-purple-800">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" fillOpacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/captain-home?tab=matches')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft size={20} className="text-white" />
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                {/* Icon badge */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <FiAward size={22} className="text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  Đánh giá Sau Trận Đấu
                </h1>
              </div>
              <div className="flex items-center gap-2 ml-14 text-indigo-100">
                <FiCalendar size={14} />
                <p className="text-sm font-medium">
                  Trận đấu ngày {matchData && new Date(matchData.matchDate || matchData.MatchDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L1440 50L1440 0C1200 40 960 50 720 45C480 40 240 25 0 0L0 50Z" className="fill-slate-50 dark:fill-wc-navy-900" />
          </svg>
        </div>
      </div>

      {/* ───── Main Content ───── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-10 space-y-6 animate-[fadeInUp_0.5s_ease-out]">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══════ Team Rating Card ═══════ */}
          <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl shadow-lg shadow-indigo-500/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm overflow-hidden animate-[fadeInUp_0.55s_ease-out]">
            {/* Gradient accent top border */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            
            <div className="p-6 pt-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <FiStar size={16} className="text-white" />
                </div>
                Đánh giá Tập thể Đội đối thủ
              </h2>

              <div className="space-y-6">
                {/* Stars */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Thái độ & Trình độ (Sao)
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className="group p-1.5 rounded-xl transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                      >
                        <FiStar
                          size={32}
                          className={`transition-colors duration-200 ${
                            star <= ratingScore
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Coloured label pill */}
                  <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${STAR_COLORS[ratingScore]}`}>
                    <FiStar size={13} className="fill-current" />
                    {STAR_LABELS[ratingScore]}
                  </span>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Nhận xét thêm <span className="font-normal text-slate-400">(Không bắt buộc)</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-shadow placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    rows="4"
                    placeholder="Nhập nhận xét của bạn về lối chơi, thái độ của đội bạn..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  onClick={submitTeamRating}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2 text-[15px]"
                >
                  <FiSend size={16} />
                  Gửi Đánh Giá Đội
                </button>
              </div>
            </div>
          </div>

          {/* ═══════ Individual Rating Card ═══════ */}
          <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl shadow-lg shadow-indigo-500/5 dark:shadow-black/20 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm overflow-hidden flex flex-col h-[600px] animate-[fadeInUp_0.65s_ease-out]">
            {/* Gradient accent top border */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="p-6 pt-5 flex flex-col flex-1 min-h-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FiUsers size={16} className="text-white" />
                </div>
                Đánh giá Cá nhân
                {opponentMembers.length > 0 && (
                  <span className="ml-auto text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2.5 py-1 rounded-full">
                    {opponentMembers.length} cầu thủ
                  </span>
                )}
              </h2>
              
              {opponentMembers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center">
                    <FiUsers size={28} className="text-slate-300 dark:text-slate-500" />
                  </div>
                  <p className="text-sm text-center max-w-[220px]">Đội đối thủ chưa có thành viên nào trên hệ thống.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {opponentMembers.map((member, idx) => (
                    <div
                      key={member.userId}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        idx % 2 === 0
                          ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/50'
                      }`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        {/* Avatar circle */}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <span className="text-white font-bold text-sm uppercase">
                            {(member.fullName || '?').charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 dark:text-white block truncate text-[15px]">{member.fullName}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {member.role === 'Captain' ? '⭐ Đội trưởng' : '🏃 Cầu thủ'}
                          </span>
                        </div>

                        {playerRatings[member.userId]?.rated ? (
                          <span className="text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 flex-shrink-0 shadow-sm">
                            <FiCheckCircle size={14} /> Đã gửi
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRateOpponentPlayer(member.userId)}
                            className="text-sm bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/25 hover:-translate-y-0.5 flex items-center gap-1 flex-shrink-0"
                          >
                            <FiSend size={12} /> Gửi
                          </button>
                        )}
                      </div>

                      {!playerRatings[member.userId]?.rated && (
                        <div className="space-y-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/40 ml-13">
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setPlayerRatings(prev => ({...prev, [member.userId]: {...(prev[member.userId]||{}), score: star}}))}
                                className="p-0.5 rounded-lg transition-all duration-150 hover:scale-125 focus:outline-none"
                              >
                                <FiStar 
                                  size={20}
                                  className={`transition-colors duration-150 ${star <= (playerRatings[member.userId]?.score || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'}`}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-slate-400 dark:text-slate-500 self-center ml-1.5">
                              {(playerRatings[member.userId]?.score || 5)}/5
                            </span>
                          </div>
                          <input 
                            type="text"
                            placeholder="Nhận xét cá nhân (không bắt buộc)"
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={playerRatings[member.userId]?.comment || ''}
                            onChange={(e) => setPlayerRatings(prev => ({...prev, [member.userId]: {...(prev[member.userId]||{}), comment: e.target.value}}))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───── Bottom "Hoàn tất" button ───── */}
        <div className="flex justify-center pt-2 pb-4 animate-[fadeInUp_0.75s_ease-out]">
          <button
            onClick={() => navigate('/captain-home?tab=matches')}
            className="px-10 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/35 flex items-center gap-2.5 text-[15px]"
          >
            <FiCheckCircle size={18} />
            Hoàn tất Đánh giá
          </button>
        </div>

      </div>

      {/* ───── Keyframe animation (injected via style tag) ───── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
