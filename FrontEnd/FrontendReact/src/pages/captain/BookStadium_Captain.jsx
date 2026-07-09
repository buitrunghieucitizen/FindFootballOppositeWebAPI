import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { captainService } from '../../services/captainService';
import playerService from '../../services/playerService';
import { FiMapPin, FiStar, FiPhone, FiClock, FiCheckCircle, FiSearch, FiPlusCircle, FiArrowLeft } from 'react-icons/fi';
import PitchCalendar from '../../components/PitchCalendar';
import { useNavigate } from 'react-router-dom';

export default function BookStadium_Captain() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const service = user?.role === 'Player' ? playerService : captainService;
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(null); // Pitch ID
  const [bookingType, setBookingType] = useState('single'); // 'single' or 'recurring'
  const [bookingData, setBookingData] = useState({ date: '', startTime: '', endTime: '', dayOfWeek: 0, fromDate: '', toDate: '' });
  const [paymentOption, setPaymentOption] = useState('pay_later');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const data = await service.getStadiums();
      setStadiums(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách sân thể thao. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (stadiumId) => {
    try {
      setDetailsLoading(true);
      const details = await service.getStadiumDetails(stadiumId);
      setSelectedStadium(details);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết sân. Vui lòng thử lại.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBookPitch = async (e, pitchId) => {
    e.preventDefault();
    try {
      setBookingLoading(true);
      
      if (bookingType === 'single') {
        const startDateTime = `${bookingData.date}T${bookingData.startTime}:00`;
        const endDateTime = `${bookingData.date}T${bookingData.endTime}:00`;
        
        const bookingMatchId = localStorage.getItem('bookingMatchId');

        await service.bookPitch({
          PitchId: pitchId,
          StartTime: startDateTime,
          EndTime: endDateTime,
          MatchId: bookingMatchId ? parseInt(bookingMatchId) : null,
          BookingType: paymentOption
        });

        localStorage.removeItem('bookingMatchId');
        alert('Gửi yêu cầu đặt sân thành công!');
        navigate('/captain/match/invite');
      } else {
        await service.bookRecurringPitch({
          PitchId: pitchId,
          DayOfWeek: bookingData.dayOfWeek,
          StartTime: `${bookingData.startTime}:00`,
          EndTime: `${bookingData.endTime}:00`,
          FromDate: bookingData.fromDate,
          ToDate: bookingData.toDate
        });
        alert('Đã gửi yêu cầu đặt lịch cố định. Vui lòng chờ chủ sân xác nhận.');
      }

      setShowBookingForm(null);
      setBookingData({ date: '', startTime: '', endTime: '', dayOfWeek: 0, fromDate: '', toDate: '' });
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi đặt sân. Vui lòng thử lại.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/30 to-amber-50/20 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-navy-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Gradient Hero Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-wc-navy-800 via-wc-navy-900 to-slate-900 dark:from-wc-navy-800 dark:via-wc-navy-900 dark:to-slate-900 p-6 sm:p-8 shadow-xl shadow-wc-navy-900/30 dark:shadow-wc-navy-950/40 animate-fade-in">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
          
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => navigate('/captain-home?tab=matches')}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <FiArrowLeft size={22} className="text-white" />
            </button>
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
              <FiCheckCircle size={28} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Bước 2: Đặt Sân Thi Đấu</h1>
              <p className="text-emerald-100/80 text-sm mt-0.5">Chọn sân và khung giờ phù hợp cho trận đấu của bạn</p>
            </div>
          </div>
        </div>

        {/* ── Step Indicators ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between bg-white/70 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-4 border border-white/50 dark:border-slate-700/50 shadow-sm">
            {[
              { icon: FiPlusCircle, label: 'Tạo kèo', active: false },
              { icon: FiCheckCircle, label: 'Đặt sân', active: true },
              { icon: FiSearch, label: 'Tìm đối', active: false },
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
        
        <div className="flex justify-between items-center mt-6 mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Danh sách Sân thể thao</h2>
          <button onClick={() => navigate('/captain/match/invite')} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-bold transition-colors">
            Bỏ qua & Tìm đối
          </button>
        </div>

      {stadiums.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 shadow-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Chưa có dữ liệu sân thể thao</h3>
          <p className="text-slate-500 dark:text-slate-400">Hiện tại hệ thống chưa có sân thể thao nào hoặc đang cập nhật.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stadiums.map((stadium) => (
            <div key={stadium.id || Math.random()} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden hover:shadow-2xl transition-all">
              <div className="h-48 bg-slate-200 w-full object-cover">
                {stadium.imageUrl ? (
                  <img src={stadium.imageUrl} alt={stadium.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-100 text-emerald-500">
                    <FiMapPin className="w-12 h-12 opacity-50" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{stadium.stadiumName || 'Sân thể thao không tên'}</h3>
                
                <div className="space-y-2 mb-4">
                  <a 
                    href={stadium.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stadium.address)}` : '#'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors group cursor-pointer"
                  >
                    <FiMapPin className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0 group-hover:text-emerald-500 transition-colors" />
                    <span className="line-clamp-2 underline decoration-dashed underline-offset-4">{stadium.address || 'Chưa có địa chỉ'}</span>
                  </a>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <FiPhone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{stadium.hotline || 'Chưa có SĐT'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <FiStar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{stadium.rating ? `${stadium.rating}/5` : 'Chưa có đánh giá'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(stadium.stadiumId)}
                  disabled={detailsLoading}
                  className="w-full py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  {detailsLoading ? 'Đang tải...' : 'Xem chi tiết'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStadium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800/90 backdrop-blur">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Chi tiết sân thể thao</h3>
              <button onClick={() => setSelectedStadium(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-6">
                  <h4 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedStadium.stadiumName}</h4>
                </div>
              </div>

              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <FiMapPin className="w-20 h-20 text-emerald-500 opacity-20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                      <FiMapPin size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Địa chỉ</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {selectedStadium.address || 'Chưa cập nhật địa chỉ'}
                      </div>
                      {((selectedStadium.latitude && selectedStadium.longitude) || selectedStadium.address) && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedStadium.latitude && selectedStadium.longitude ? `${selectedStadium.latitude},${selectedStadium.longitude}` : encodeURIComponent(selectedStadium.address)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                        >
                          <FiMapPin /> Xem trên Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <FiPhone size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Hotline liên hệ</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {selectedStadium.hotline || 'Chưa có SĐT'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h5 className="font-bold text-slate-800 dark:text-white mb-2">Thông tin chi tiết</h5>
                <div className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
                  {selectedStadium.description || 'Chưa có mô tả chi tiết'}
                </div>
              </div>

              <h5 className="font-bold text-slate-800 dark:text-white mb-4 text-lg border-b border-slate-100 dark:border-slate-700/50 pb-2">Danh sách sân lẻ ({selectedStadium.pitches?.length || 0})</h5>
              {selectedStadium.pitches && selectedStadium.pitches.length > 0 ? (
                <div className="space-y-4">
                  {selectedStadium.pitches.map((pitch, idx) => (
                    <div key={idx} className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-200 dark:border-emerald-800 transition-colors p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-800 dark:text-white">{pitch.pitchName}</strong>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-3">
                            <span>Loại: {pitch.grassType || 'Cỏ nhân tạo'}</span>
                            <span>Kích thước: {pitch.pitchSize || 'Sân 7'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-emerald-600">{(pitch.pricePerHour || 0).toLocaleString()} VNĐ/1 ca</span>
                          <button 
                            onClick={() => setShowBookingForm(pitch.pitchId || pitch.id)}
                            className="text-xs text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg mt-2 font-bold shadow-sm"
                          >
                            Đặt Sân
                          </button>
                        </div>
                      </div>
                      
                      {showBookingForm === (pitch.pitchId || pitch.id) && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-xl mt-4 space-y-4">
                          <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit mb-4">
                            <button
                              type="button"
                              onClick={() => setBookingType('single')}
                              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${bookingType === 'single' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                              Đặt sân lẻ
                            </button>
                            <button
                              type="button"
                              onClick={() => setBookingType('recurring')}
                              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${bookingType === 'recurring' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                              Đặt lịch cố định
                            </button>
                          </div>

                          <form onSubmit={(e) => handleBookPitch(e, pitch.pitchId || pitch.id)} className="space-y-4">
                            {bookingType === 'single' ? (
                              <>
                                <PitchCalendar 
                                  pitchId={pitch.pitchId || pitch.id} 
                                  onSelectTimeSlot={(date, time) => {
                                    const [h, m] = time.split(':').map(Number);
                                    let totalMins = h * 60 + m + 90;
                                    let endH = Math.floor(totalMins / 60) % 24;
                                    let endM = totalMins % 60;
                                    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                    setBookingData({ ...bookingData, date, startTime: time, endTime: endTimeStr });
                                  }} 
                                />
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <h6 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center gap-2">
                                    <FiClock className="text-emerald-500" /> Xác nhận thời gian đặt
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Ngày đá</label>
                                      <input 
                                        type="date" required 
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Giờ bắt đầu</label>
                                      <input 
                                        type="time" required 
                                        value={bookingData.startTime}
                                        onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Giờ kết thúc</label>
                                      <input 
                                        type="time" required 
                                        value={bookingData.endTime}
                                        onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                                <h6 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                  <FiCalendar className="text-emerald-500" /> Cấu hình lịch cố định
                                </h6>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Thứ</label>
                                    <select 
                                      required 
                                      value={bookingData.dayOfWeek}
                                      onChange={(e) => setBookingData({...bookingData, dayOfWeek: Number(e.target.value)})}
                                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    >
                                      <option value={1}>Thứ 2</option>
                                      <option value={2}>Thứ 3</option>
                                      <option value={3}>Thứ 4</option>
                                      <option value={4}>Thứ 5</option>
                                      <option value={5}>Thứ 6</option>
                                      <option value={6}>Thứ 7</option>
                                      <option value={0}>Chủ nhật</option>
                                    </select>
                                  </div>
                                  <div className="col-span-1">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Giờ bắt đầu</label>
                                    <input 
                                      type="time" required 
                                      value={bookingData.startTime}
                                      onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Giờ kết thúc</label>
                                    <input 
                                      type="time" required 
                                      value={bookingData.endTime}
                                      onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Từ ngày</label>
                                    <input 
                                      type="date" required 
                                      value={bookingData.fromDate}
                                      onChange={(e) => setBookingData({...bookingData, fromDate: e.target.value})}
                                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Đến ngày</label>
                                    <input 
                                      type="date" required 
                                      value={bookingData.toDate}
                                      onChange={(e) => setBookingData({...bookingData, toDate: e.target.value})}
                                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                              <h6 className="font-bold text-slate-800 dark:text-white mb-3 text-sm">Hình thức thanh toán</h6>
                              <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                  <input type="radio" name="paymentOption" value="pay_later" checked={paymentOption === 'pay_later'} onChange={() => setPaymentOption('pay_later')} className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-gray-300" />
                                  <span>Thanh toán sau khi đá</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                  <input type="radio" name="paymentOption" value="deposit_30" checked={paymentOption === 'deposit_30'} onChange={() => setPaymentOption('deposit_30')} className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-gray-300" />
                                  <span>Cọc 30% qua chuyển khoản</span>
                                </label>
                                {paymentOption === 'deposit_30' && (
                                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center">
                                    <p className="text-xs text-slate-500 mb-2">Vui lòng quét mã QR dưới đây để chuyển tiền cọc cho chủ sân.</p>
                                    {selectedStadium?.qrCodeUrl ? (
                                      <img src={selectedStadium.qrCodeUrl} alt="QR Code" className="w-40 h-40 object-cover rounded border border-slate-200 shadow-sm" />
                                    ) : (
                                      <div className="w-40 h-40 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500 rounded text-center p-4">
                                        Chủ sân chưa cập nhật QR Code.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                              <button type="button" onClick={() => setShowBookingForm(null)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                Hủy
                              </button>
                              <button type="submit" disabled={bookingLoading} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-500 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-600 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5">
                                {bookingLoading ? 'Đang gửi...' : 'Xác nhận Đặt Sân'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 italic text-sm">Sân thể thao này chưa có sân lẻ nào được đăng ký.</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
