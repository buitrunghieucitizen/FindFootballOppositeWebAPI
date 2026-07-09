import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiFileText, FiPlusCircle, FiSearch, FiCheckCircle, FiInfo, FiSend, FiXCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';
import { publicService } from '../../services/publicService';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateChallenge_Captain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [newChallengeData, setNewChallengeData] = useState({ matchDate: '', startTime: '', location: '', notes: '' });
  
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      loadStadiums();
    }
  }, [step]);

  const loadStadiums = async () => {
    try {
      const res = await publicService.getStadiums();
      setStadiums(res.data || res.$values || res || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách sân', err);
    }
  };

  const handleNextStep = () => {
    if (!newChallengeData.matchDate || !newChallengeData.startTime) {
      Swal.fire('Lỗi', 'Vui lòng nhập Ngày và Giờ thi đấu', 'warning');
      return;
    }
    setStep(2);
  };

  const handleCreateChallenge = async () => {
    try {
      setLoading(true);
      let formattedStartTime = newChallengeData.startTime;
      if (formattedStartTime && formattedStartTime.length === 5) {
        formattedStartTime += ':00'; // Append seconds
      }
      
      // Step 1: Create Match
      const createRes = await captainService.createChallenge({
        matchDate: newChallengeData.matchDate || null,
        startTime: formattedStartTime || null,
        location: selectedStadium ? selectedStadium.stadiumName : newChallengeData.location,
        notes: newChallengeData.notes
      });
      
      const matchIdCreated = createRes.matchId || createRes.MatchId || createRes.id;
      
      // Step 2: Book Stadium if selected
      if (selectedStadium) {
        try {
          await captainService.bookPitch({
            matchId: matchIdCreated,
            stadiumId: selectedStadium.stadiumId,
            bookingDate: newChallengeData.matchDate,
            startTime: formattedStartTime,
            duration: 60, // Mặc định 60 phút
            notes: 'Đặt sân cho kèo giao hữu'
          });
        } catch (bookingErr) {
          console.error("Lỗi đặt sân:", bookingErr);
          // Vẫn cho qua, vì đã tạo match thành công
        }
      }

      const confirmResult = await Swal.fire({
        title: 'Tạo kèo thành công!',
        text: 'Trận đấu đang ở trạng thái Đang tìm đối thủ. Bạn có muốn đi đến trang danh sách trận đấu ngay không?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Đến danh sách trận',
        cancelButtonText: 'Tạo trận khác',
        allowOutsideClick: false
      });

      if (confirmResult.isConfirmed) {
        navigate('/captain-home?tab=matches');
      } else {
        setNewChallengeData({ matchDate: '', startTime: '', location: '', notes: '' });
        setSelectedStadium(null);
        setStep(1);
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
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: FiPlusCircle, label: 'Thông tin kèo', active: step >= 1 },
    { icon: FiMapPin, label: 'Đặt sân', active: step >= 2 },
    { icon: FiCheckCircle, label: 'Hoàn tất', active: step === 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-amber-50/20 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-navy-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Gradient Hero Header ── */}
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wc-navy-800 via-wc-navy-900 to-slate-900 dark:from-wc-navy-800 dark:via-wc-navy-900 dark:to-slate-900 p-6 sm:p-8 shadow-xl shadow-wc-navy-900/30 dark:shadow-wc-navy-950/40 animate-fade-in"
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
              <p className="text-wc-gold-100/80 text-sm mt-0.5">Điền thông tin và đặt sân ngay trong 1 bước</p>
            </div>
          </div>
        </div>

        {/* ── Step Indicators ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 border border-white/50 dark:border-slate-700/50 shadow-sm">
            {steps.map((s, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      s.active
                        ? 'bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 shadow-lg shadow-wc-gold-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <s.icon size={18} />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      s.active ? 'text-wc-gold-600 dark:text-wc-gold-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {idx + 1}. {s.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className={`flex-shrink-0 w-8 sm:w-14 h-0.5 rounded-full -mt-4 ${
                    steps[idx+1].active ? 'bg-wc-gold-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Info / Tip Banner ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-wc-navy-900/50 dark:to-wc-navy-800/50 border border-blue-200/60 dark:border-wc-navy-700/50 rounded-xl px-4 py-3.5">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-wc-navy-800 flex items-center justify-center mt-0.5">
              <FiInfo size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Quy trình tạo kèo mới</p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/70 mt-0.5 leading-relaxed">
                Bạn điền thông tin ngày giờ, sau đó có thể chọn <span className="font-semibold text-wc-gold-600">Đặt sân</span> ngay trên hệ thống. 
                Sau khi hoàn tất, kèo sẽ được hiển thị công khai để tìm đối.
              </p>
            </div>
          </div>
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden relative animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-wc-gold-500/20 via-amber-500/20 to-wc-gold-500/20 dark:from-wc-gold-500/10 dark:via-amber-500/10 dark:to-wc-gold-500/10" />

          <div className="p-6 sm:p-8">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-md bg-wc-gold-100 dark:bg-wc-gold-900/40 flex items-center justify-center">
                        <FiCalendar size={14} className="text-wc-gold-600 dark:text-wc-gold-400" />
                      </div>
                      Ngày thi đấu
                    </label>
                    <input
                      type="date"
                      value={newChallengeData.matchDate}
                      onChange={(e) => setNewChallengeData({ ...newChallengeData, matchDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/50 focus:border-wc-gold-400 dark:focus:border-wc-gold-500 transition-all duration-200 hover:border-wc-gold-300 dark:hover:border-wc-gold-700 shadow-sm"
                      required
                    />
                  </div>

                  {/* Time Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-md bg-wc-gold-100 dark:bg-wc-gold-900/40 flex items-center justify-center">
                        <FiClock size={14} className="text-wc-gold-600 dark:text-wc-gold-400" />
                      </div>
                      Thời gian
                    </label>
                    <input
                      type="time"
                      value={newChallengeData.startTime}
                      onChange={(e) => setNewChallengeData({ ...newChallengeData, startTime: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/50 focus:border-wc-gold-400 dark:focus:border-wc-gold-500 transition-all duration-200 hover:border-wc-gold-300 dark:hover:border-wc-gold-700 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 rounded-md bg-wc-gold-100 dark:bg-wc-gold-900/40 flex items-center justify-center">
                      <FiFileText size={14} className="text-wc-gold-600 dark:text-wc-gold-400" />
                    </div>
                    Ghi chú / Yêu cầu
                  </label>
                  <textarea
                    rows="3"
                    value={newChallengeData.notes}
                    onChange={(e) => setNewChallengeData({ ...newChallengeData, notes: e.target.value })}
                    placeholder="Ví dụ: Cần tìm đối thủ đá 5v5, trình độ trung bình yếu..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/50 focus:border-wc-gold-400 dark:focus:border-wc-gold-500 transition-all duration-200 hover:border-wc-gold-300 dark:hover:border-wc-gold-700 shadow-sm resize-none"
                  />
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 bg-gradient-to-r from-wc-gold-500 via-wc-gold-600 to-amber-500 hover:from-wc-gold-400 hover:via-wc-gold-500 hover:to-amber-400 text-wc-navy-950 shadow-md shadow-wc-gold-500/25 hover:shadow-wc-gold-500/40 hover:-translate-y-0.5"
                  >
                    Tiếp tục Đặt sân
                    <FiArrowLeft className="rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                  <div 
                    onClick={() => setSelectedStadium(null)}
                    className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                      selectedStadium === null 
                      ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-wc-gold-300'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <FiMapPin className="text-2xl text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Không đặt sân</h4>
                    <p className="text-xs text-slate-500 mb-4">Hoặc đã có sân ngoài, tự điền tên sân</p>
                    {selectedStadium === null && <FiCheckCircle className="text-wc-gold-600 text-2xl" />}
                  </div>

                  {stadiums.map(stadium => (
                    <div 
                      key={stadium.stadiumId}
                      onClick={() => setSelectedStadium(stadium)}
                      className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden ${
                        selectedStadium?.stadiumId === stadium.stadiumId 
                        ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-wc-gold-300'
                      }`}
                    >
                      {stadium.imageUrls && stadium.imageUrls.length > 0 ? (
                        <img src={stadium.imageUrls[0]} alt={stadium.stadiumName} className="w-full h-32 object-cover rounded-xl mb-3" />
                      ) : (
                        <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center">
                          <FiMapPin className="text-slate-300 text-2xl" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 mb-1">{stadium.stadiumName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{stadium.address}</p>
                      {selectedStadium?.stadiumId === stadium.stadiumId && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-wc-gold-500 rounded-full flex items-center justify-center text-white shadow-sm">
                          <FiCheckCircle />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedStadium === null && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-md bg-wc-gold-100 dark:bg-wc-gold-900/40 flex items-center justify-center">
                        <FiMapPin size={14} className="text-wc-gold-600 dark:text-wc-gold-400" />
                      </div>
                      Địa điểm sân (tự nhập)
                    </label>
                    <input
                      type="text"
                      value={newChallengeData.location}
                      onChange={(e) => setNewChallengeData({ ...newChallengeData, location: e.target.value })}
                      placeholder="Nhập tên sân và địa chỉ cụ thể..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/50 focus:border-wc-gold-400 dark:focus:border-wc-gold-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleCreateChallenge}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all duration-200 bg-gradient-to-r from-wc-gold-500 via-wc-gold-600 to-amber-500 hover:from-wc-gold-400 hover:via-wc-gold-500 hover:to-amber-400 text-wc-navy-950 shadow-md shadow-wc-gold-500/25 hover:shadow-wc-gold-500/40 hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo Trận'}
                    {!loading && <FiSend size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
