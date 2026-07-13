import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiFileText, FiPlusCircle, FiCheckCircle, FiInfo, FiSend, FiUsers, FiGlobe } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';
import { publicService } from '../../services/publicService';
import { useAuth } from '../../contexts/AuthContext';
import PitchCalendar from '../../components/PitchCalendar';
import SelectTeamModal from './SelectTeamModal';

export default function CreateChallenge_Captain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Info
  const [notes, setNotes] = useState('');

  // Step 2: Book Stadium
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [stadiumDetails, setStadiumDetails] = useState(null);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [isNoStadium, setIsNoStadium] = useState(false);
  const [matchDate, setMatchDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  
  // New States for Payment & Recurring
  const [paymentMethod, setPaymentMethod] = useState('pay_later'); // 'pay_later' | 'chuyen_khoan'
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(1);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [createdScheduleId, setCreatedScheduleId] = useState(null);

  // Step 3: Opponent
  const [opponentType, setOpponentType] = useState('public');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedTeam, setInvitedTeam] = useState(null);

  useEffect(() => {
    if (step === 2 && stadiums.length === 0) {
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

  const handleSelectStadium = async (stadium) => {
    setIsNoStadium(false);
    setSelectedStadium(stadium);
    setSelectedPitch(null);
    setMatchDate('');
    setStartTime('');
    if (stadium) {
      try {
        setDetailsLoading(true);
        // Fallback to captainService if publicService doesn't have it
        const service = captainService; 
        const details = await service.getStadiumDetails(stadium.stadiumId || stadium.id);
        setStadiumDetails(details);
      } catch (err) {
        console.error(err);
      } finally {
        setDetailsLoading(false);
      }
    } else {
      setStadiumDetails(null);
    }
  };

  const handleSelectNoStadium = () => {
    setIsNoStadium(true);
    setSelectedStadium(null);
    setStadiumDetails(null);
    setSelectedPitch(null);
    setMatchDate('');
    setStartTime('');
  };

  const validateStep2 = () => {
    if (!matchDate || !startTime) {
      Swal.fire('Lỗi', 'Vui lòng chọn Ngày và Giờ thi đấu', 'warning');
      return false;
    }
    if (isNoStadium && !manualLocation) {
      Swal.fire('Lỗi', 'Vui lòng nhập địa điểm thi đấu', 'warning');
      return false;
    }
    if (!isNoStadium && !selectedPitch) {
      Swal.fire('Lỗi', 'Vui lòng chọn Sân con', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (opponentType === 'invite' && !invitedTeam) {
      Swal.fire('Lỗi', 'Vui lòng chọn đội để mời', 'warning');
      return;
    }

    try {
      setLoading(true);
      let formattedStartTime = startTime;
      if (formattedStartTime && formattedStartTime.length === 5) {
        formattedStartTime += ':00'; // Append seconds
      }
      
      const locationName = isNoStadium ? manualLocation : (selectedStadium?.stadiumName || 'Chưa xác định');

      // 1. Create Match
      const createRes = await captainService.createChallenge({
        matchDate: matchDate || null,
        startTime: formattedStartTime || null,
        location: locationName,
        notes: notes
      });
      
      const matchIdCreated = createRes.matchId || createRes.MatchId || createRes.id;
      
      // 2. Book Pitch if selected
      if (!isNoStadium && selectedPitch) {
        const startDateTime = `${matchDate}T${startTime}:00`;
        // For endTime, fallback to +90 mins if missing
        let formattedEndTime = endTime;
        if (!formattedEndTime) {
          const [h, m] = startTime.split(':').map(Number);
          let totalMins = h * 60 + m + 90;
          let endH = Math.floor(totalMins / 60) % 24;
          let endM = totalMins % 60;
          formattedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
        } else if (formattedEndTime.length === 5) {
          formattedEndTime += ':00';
        }
        const endDateTime = `${matchDate}T${formattedEndTime}`;

        await captainService.bookPitch({
          PitchId: selectedPitch.pitchId || selectedPitch.id,
          StartTime: startDateTime,
          EndTime: endDateTime,
          MatchId: parseInt(matchIdCreated),
          BookingType: paymentMethod,
          NumberOfWeeks: isRecurring ? parseInt(recurringWeeks) : 1
        });
      }

      // 3. Invite Team if selected
      if (opponentType === 'invite' && invitedTeam) {
        await captainService.inviteTeamToMatch(matchIdCreated, invitedTeam.teamId || invitedTeam.id);
      }

      if (!isNoStadium && selectedPitch && paymentMethod === 'chuyen_khoan') {
        setLoading(false);
        setShowPaywallModal(true);
        return;
      }

      Swal.fire({
        title: 'Thành công!',
        text: 'Đã tạo kèo và hoàn tất các thủ tục.',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      }).then(() => {
        navigate('/captain-home?tab=matches');
      });

    } catch (err) {
      console.error(err);
      let errorMsg = 'Có lỗi xảy ra trong quá trình tạo kèo.';
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
    { icon: FiFileText, label: 'Thông tin', active: step >= 1 },
    { icon: FiMapPin, label: 'Đặt sân & Khung giờ', active: step >= 2 },
    { icon: FiUsers, label: 'Tìm đối thủ', active: step >= 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-amber-50/20 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-navy-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Gradient Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wc-navy-800 via-wc-navy-900 to-slate-900 p-6 sm:p-8 shadow-xl shadow-wc-navy-900/30 animate-fade-in">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => navigate('/captain-home?tab=matches')}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200"
            >
              <FiArrowLeft size={22} className="text-white" />
            </button>
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiPlusCircle size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Tạo Kèo Mới (3 Bước)</h1>
              <p className="text-wc-gold-100/80 text-sm mt-0.5">Nhanh chóng tạo trận, đặt sân và mời đối thủ</p>
            </div>
          </div>
        </div>

        {/* ── Step Indicators ── */}
        <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl px-4 sm:px-8 py-4 border border-white/50 dark:border-slate-700/50 shadow-sm animate-fade-in-up">
          {steps.map((s, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${s.active ? 'bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-semibold ${s.active ? 'text-wc-gold-600' : 'text-slate-400'}`}>
                  {idx + 1}. {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-shrink-0 w-8 sm:w-16 h-0.5 rounded-full -mt-4 ${steps[idx+1].active ? 'bg-wc-gold-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative animate-fade-in-up">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-wc-gold-500/20 via-amber-500/20 to-wc-gold-500/20" />

          {/* STEP 1: INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-300">
                <FiInfo className="mt-0.5 shrink-0" />
                <p className="text-sm">Bước 1: Nhập các yêu cầu hoặc mô tả kèo để các đội khác dễ dàng nắm bắt thông tin. Ngày giờ sẽ được chọn ở bước tiếp theo.</p>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <FiFileText className="text-wc-gold-600" /> Ghi chú / Yêu cầu
                </label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Tìm đối thủ trình độ trung bình yếu, đá 5v5, giao lưu vui vẻ..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-wc-gold-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(2)} className="bg-wc-gold-500 hover:bg-wc-gold-600 text-wc-navy-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all">
                  Tiếp tục: Đặt sân & Khung giờ
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STADIUM & TIME */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-300">
                <FiInfo className="mt-0.5 shrink-0" />
                <p className="text-sm">Bước 2: Chọn sân và khung giờ trực tiếp trên lịch. Hoặc chọn "Không đặt sân" nếu bạn đã tự liên hệ sân ngoài.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2">
                <div 
                  onClick={handleSelectNoStadium}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                    isNoStadium ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <FiMapPin className="text-2xl text-slate-400 mb-2" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Không đặt sân</h4>
                  {isNoStadium && <FiCheckCircle className="text-wc-gold-600 mt-2" />}
                </div>

                {stadiums.map(stadium => (
                  <div 
                    key={stadium.stadiumId || stadium.id}
                    onClick={() => handleSelectStadium(stadium)}
                    className={`cursor-pointer border-2 rounded-xl p-3 transition-all relative ${
                      selectedStadium?.stadiumId === (stadium.stadiumId || stadium.id)
                      ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' 
                      : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2">{stadium.stadiumName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">{stadium.address}</p>
                    {selectedStadium?.stadiumId === (stadium.stadiumId || stadium.id) && (
                      <FiCheckCircle className="absolute top-2 right-2 text-wc-gold-600" />
                    )}
                  </div>
                ))}
              </div>

              {/* No Stadium Form */}
              {isNoStadium && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày thi đấu</label>
                    <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Giờ bắt đầu</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Địa điểm (Tên sân)</label>
                    <input type="text" value={manualLocation} onChange={e => setManualLocation(e.target.value)} placeholder="Nhập tên sân..." className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
                  </div>
                </div>
              )}

              {/* Selected Stadium Pitches & Calendar */}
              {selectedStadium && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  {detailsLoading ? (
                    <div className="text-center text-slate-500 py-4">Đang tải danh sách sân con...</div>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">Chọn Sân con thuộc {selectedStadium.stadiumName}:</h4>
                      {stadiumDetails?.pitches?.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {stadiumDetails.pitches.map(pitch => (
                            <button
                              key={pitch.pitchId || pitch.id}
                              onClick={() => setSelectedPitch(pitch)}
                              className={`shrink-0 px-4 py-2 rounded-lg border-2 font-bold text-sm transition-colors ${
                                selectedPitch?.pitchId === (pitch.pitchId || pitch.id) 
                                ? 'bg-wc-gold-100 border-wc-gold-500 text-wc-gold-800' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-wc-gold-300'
                              }`}
                            >
                              {pitch.pitchName}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-500">Sân này hiện chưa có sân con nào.</p>
                      )}

                      {selectedPitch && (
                        <div className="mt-4">
                          <PitchCalendar 
                            pitchId={selectedPitch.pitchId || selectedPitch.id} 
                            onSelectTimeSlot={(date, time) => {
                              setMatchDate(date);
                              setStartTime(time);
                              
                              // Calculate endTime based on 90 mins slot
                              const [h, m] = time.split(':').map(Number);
                              let totalMins = h * 60 + m + 90;
                              let endH = Math.floor(totalMins / 60) % 24;
                              let endM = totalMins % 60;
                              setEndTime(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
                            }} 
                          />
                          {matchDate && startTime && (
                            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 font-bold flex items-center justify-center gap-2">
                              <FiCheckCircle size={18} />
                              Đã chọn: Ngày {new Date(matchDate).toLocaleDateString('vi-VN')} lúc {startTime}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {matchDate && startTime && selectedPitch && (
                        <div className="mt-6 space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Tùy chọn thanh toán & Đặt sân cố định</h4>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phương thức thanh toán</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="payment" value="pay_later" checked={paymentMethod === 'pay_later'} onChange={() => setPaymentMethod('pay_later')} className="text-indigo-600" />
                                <span className="text-sm">Thanh toán tại sân</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="payment" value="chuyen_khoan" checked={paymentMethod === 'chuyen_khoan'} onChange={() => setPaymentMethod('chuyen_khoan')} className="text-indigo-600" />
                                <span className="text-sm">Chuyển khoản (Xác nhận nhanh hơn)</span>
                              </label>
                            </div>
                          </div>

                          <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-slate-700 dark:text-slate-300">
                              <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                              Đặt sân cố định (Thuê dài hạn)
                            </label>
                            {isRecurring && (
                              <div className="mt-3 pl-6 border-l-2 border-indigo-200 dark:border-indigo-800">
                                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Số tuần liên tiếp muốn đặt (Tối đa 12 tuần)</label>
                                <input 
                                  type="number" 
                                  min="1" max="12" 
                                  value={recurringWeeks} 
                                  onChange={e => setRecurringWeeks(e.target.value)} 
                                  className="w-32 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-sm" 
                                />
                                <p className="text-xs text-slate-500 mt-2">Hệ thống sẽ giữ sân này cho bạn vào khung giờ này trong {recurringWeeks} tuần tiếp theo. (Chỉ tạo 1 kèo công khai cho tuần đầu tiên).</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Quay lại
                </button>
                <button onClick={() => { if(validateStep2()) setStep(3); }} className="bg-wc-gold-500 hover:bg-wc-gold-600 text-wc-navy-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all">
                  Tiếp tục: Tìm Đối Thủ
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OPPONENT */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-800 dark:text-blue-300">
                <FiInfo className="mt-0.5 shrink-0" />
                <p className="text-sm">Bước 3: Chọn phương thức tìm đối thủ. Kèo sẽ được tạo ngay sau bước này.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Public Option */}
                <div 
                  onClick={() => { setOpponentType('public'); setInvitedTeam(null); }}
                  className={`cursor-pointer border-2 rounded-2xl p-6 transition-all relative ${
                    opponentType === 'public' ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-wc-gold-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <FiGlobe size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Tạo Kèo Công Khai</h4>
                  <p className="text-sm text-slate-500">Đăng trận đấu lên bảng tin hệ thống. Bất kỳ đội bóng nào cũng có thể nhìn thấy và xin bắt kèo.</p>
                  {opponentType === 'public' && <FiCheckCircle className="absolute top-4 right-4 text-wc-gold-600 text-xl" />}
                </div>

                {/* Invite Option */}
                <div 
                  onClick={() => setOpponentType('invite')}
                  className={`cursor-pointer border-2 rounded-2xl p-6 transition-all relative ${
                    opponentType === 'invite' ? 'border-wc-gold-500 bg-wc-gold-50/50 dark:bg-wc-gold-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-wc-gold-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                    <FiUsers size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Mời Đội Cụ Thể</h4>
                  <p className="text-sm text-slate-500 mb-4">Tìm và gửi trực tiếp lời mời giao hữu đến một đội bóng bạn muốn.</p>
                  
                  {opponentType === 'invite' && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                      {invitedTeam ? (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-500" />
                            <span className="font-bold text-sm text-slate-800 dark:text-white">{invitedTeam.teamName}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); }} className="text-xs text-blue-500 hover:underline">Đổi</button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); }}
                          className="w-full py-2 bg-wc-gold-100 text-wc-gold-700 rounded-lg font-bold text-sm hover:bg-wc-gold-200 transition-colors"
                        >
                          + Bấm để tìm đội
                        </button>
                      )}
                    </div>
                  )}
                  {opponentType === 'invite' && <FiCheckCircle className="absolute top-4 right-4 text-wc-gold-600 text-xl" />}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Quay lại
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 py-2.5 rounded-xl shadow-md transition-all shadow-emerald-500/25 disabled:opacity-70"
                >
                  {loading ? 'Đang xử lý...' : 'Hoàn Tất Tạo Kèo'}
                  {!loading && <FiSend size={16} />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Select Team Modal */}
      <SelectTeamModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSelect={(team) => {
          setInvitedTeam(team);
          setShowInviteModal(false);
        }}
      />
      
      {/* Paywall Modal */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Thanh toán Đặt Sân</h3>
            <p className="text-sm text-slate-500 mb-6">Vui lòng quét mã QR dưới đây để thanh toán cho chủ sân. Chủ sân sẽ xác nhận sau khi nhận được tiền.</p>
            {stadiumDetails?.qrCodeUrl ? (
              <img src={stadiumDetails.qrCodeUrl} alt="QR Code" className="mx-auto h-48 w-auto object-contain rounded border border-slate-200 p-2" />
            ) : (
              <div className="text-slate-400 italic mb-4">Chủ sân chưa cập nhật mã QR. Vui lòng liên hệ số điện thoại: {stadiumDetails?.hotline}</div>
            )}
            <div className="mt-4 text-left bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Ngân hàng:</strong> {stadiumDetails?.bankName || 'Chưa cập nhật'}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Số TK:</strong> {stadiumDetails?.bankAccountNumber || 'Chưa cập nhật'}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Chủ TK:</strong> {stadiumDetails?.bankAccountName || 'Chưa cập nhật'}</p>
              <p className="text-sm mt-2 text-rose-600 font-bold">Lưu ý: Ghi rõ nội dung chuyển khoản là SĐT hoặc Tên Đội của bạn.</p>
            </div>
            <button 
              onClick={() => {
                setShowPaywallModal(false);
                navigate('/captain-home?tab=matches');
              }} 
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
            >
              Đã thanh toán xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
