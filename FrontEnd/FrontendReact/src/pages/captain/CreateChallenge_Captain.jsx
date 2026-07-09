import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiFileText, FiPlusCircle, FiSearch, FiCheckCircle, FiInfo, FiSend, FiXCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';

export default function CreateChallenge_Captain() {
  const navigate = useNavigate();
  const [newChallengeData, setNewChallengeData] = useState({ matchDate: '', startTime: '', location: '', notes: '' });

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      let formattedStartTime = newChallengeData.startTime;
      if (formattedStartTime && formattedStartTime.length === 5) {
        formattedStartTime += ':00'; // Append seconds
      }
      
      const res = await captainService.createChallenge({
        matchDate: newChallengeData.matchDate || null,
        startTime: formattedStartTime || null,
        location: newChallengeData.location,
        notes: newChallengeData.notes
      });
      
      const matchIdCreated = res.matchId || res.MatchId || res.id;
      
      const confirmResult = await Swal.fire({
        title: 'Tạo kèo thành công!',
        text: 'Trận đấu đang ở trạng thái Đang tìm đối thủ. Vui lòng tiếp tục tìm và đặt sân cho trận đấu này.',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Tiếp tục tìm sân',
        cancelButtonText: 'Hủy trận đấu',
        allowOutsideClick: false
      });

      if (confirmResult.isConfirmed) {
        localStorage.setItem('bookingMatchId', matchIdCreated);
        navigate('/captain-home?tab=stadiums');
      } else if (confirmResult.dismiss === Swal.DismissReason.cancel) {
        try {
          await captainService.cancelMatch(matchIdCreated, 'Không đặt sân');
          Swal.fire('Đã hủy', 'Trận đấu vừa tạo đã được hủy', 'info');
        } catch (e) {
          console.error(e);
        }
        navigate('/captain-home?tab=matches');
      } else {
        navigate('/captain-home?tab=matches');
      }
    } catch (err) {
      console.error(err);
      let errorMsg = 'Lỗi khi tạo yêu cầu giao hữu';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMsg = Object.values(err.response.data.errors).flat().join('\n');
      }
      Swal.fire('Lỗi', errorMsg, 'error');
    }
  };

  const steps = [
    { icon: FiPlusCircle, label: 'Tạo kèo', active: true },
    { icon: FiSearch, label: 'Tìm đối', active: false },
    { icon: FiCheckCircle, label: 'Đặt sân', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 dark:from-wc-navy-900 dark:via-slate-900 dark:to-emerald-950/30 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Gradient Hero Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-700 dark:via-teal-600 dark:to-cyan-600 p-6 sm:p-8 shadow-xl shadow-emerald-500/20 dark:shadow-emerald-900/30 animate-fade-in"
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          <div className="absolute top-1/2 right-12 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10 flex items-center gap-4">
            {/* Back button */}
            <button
              onClick={() => navigate('/captain-home?tab=matches')}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft size={22} className="text-white" />
            </button>

            {/* Icon badge */}
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
              <FiPlusCircle size={28} className="text-white" />
            </div>

            {/* Title & subtitle */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Tạo Kèo Giao Hữu Mới</h1>
              <p className="text-emerald-100/80 text-sm mt-0.5">Điền thông tin để tạo kèo & tìm đối thủ</p>
            </div>
          </div>
        </div>

        {/* ── Step Indicators ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 border border-white/50 dark:border-slate-700/50 shadow-sm">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                {/* Step item */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.active
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <step.icon size={18} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      step.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {idx + 1}. {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="flex-shrink-0 w-8 sm:w-14 h-0.5 rounded-full bg-slate-200 dark:bg-slate-700 -mt-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Info / Tip Banner ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl px-4 py-3.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center mt-0.5">
              <FiInfo size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Quy trình tạo kèo</p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-0.5 leading-relaxed">
                Bạn sẽ <span className="font-semibold">Tạo kèo</span> → <span className="font-semibold">Tìm đối thủ</span> → <span className="font-semibold">Đặt sân</span>. Sau khi tạo, hệ thống sẽ hướng dẫn bạn bước tiếp theo.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form Card with Glassmorphism ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="relative group">
            {/* Gradient glow border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10 rounded-[18px] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-white/60 dark:border-slate-700/50 p-6 sm:p-8">
              <form onSubmit={handleCreateChallenge} className="space-y-6">

                {/* Date & Time row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Match date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <FiCalendar size={13} className="text-emerald-600 dark:text-emerald-400" />
                      </span>
                      Ngày dự kiến
                    </label>
                    <input
                      type="date"
                      required
                      value={newChallengeData.matchDate}
                      onChange={e => setNewChallengeData({...newChallengeData, matchDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-slate-50/80 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                    />
                  </div>

                  {/* Start time */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <FiClock size={13} className="text-blue-600 dark:text-blue-400" />
                      </span>
                      Giờ dự kiến
                    </label>
                    <input
                      type="time"
                      required
                      value={newChallengeData.startTime}
                      onChange={e => setNewChallengeData({...newChallengeData, startTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-slate-50/80 dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                    <span className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <FiMapPin size={13} className="text-orange-600 dark:text-orange-400" />
                    </span>
                    Địa bàn hoạt động (Khu vực)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quận Cầu Giấy, Sân X..."
                    value={newChallengeData.location}
                    onChange={e => setNewChallengeData({...newChallengeData, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-slate-50/80 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                    <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <FiFileText size={13} className="text-purple-600 dark:text-purple-400" />
                    </span>
                    Ghi chú thêm
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Yêu cầu trình độ, trang phục, chia tiền sân..."
                    value={newChallengeData.notes}
                    onChange={e => setNewChallengeData({...newChallengeData, notes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-slate-50/80 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 dark:focus:border-emerald-500 resize-none transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* Cancel button */}
                  <button
                    type="button"
                    onClick={() => navigate('/captain-home?tab=matches')}
                    className="flex-1 sm:flex-none sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <FiXCircle size={18} />
                    Hủy bỏ
                  </button>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <FiSend size={18} />
                    Đăng Kèo Ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
