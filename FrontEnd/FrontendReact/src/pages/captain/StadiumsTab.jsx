import React, { useState, useEffect } from 'react';
import { captainService } from '../../services/captainService';
import { FiMapPin, FiStar, FiPhone, FiClock } from 'react-icons/fi';
import PitchCalendar from '../../components/PitchCalendar';

export default function StadiumsTab() {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Booking states
  const [showBookingForm, setShowBookingForm] = useState(null); // Pitch ID
  const [bookingData, setBookingData] = useState({ date: '', startTime: '', endTime: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchStadiums();
  }, []);

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const data = await captainService.getStadiums();
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
      const details = await captainService.getStadiumDetails(stadiumId);
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
      const startDateTime = `${bookingData.date}T${bookingData.startTime}:00`;
      const endDateTime = `${bookingData.date}T${bookingData.endTime}:00`;
      
      const bookingMatchId = localStorage.getItem('bookingMatchId');

      const res = await captainService.bookPitch({
        PitchId: pitchId,
        StartTime: startDateTime,
        EndTime: endDateTime,
        MatchId: bookingMatchId ? parseInt(bookingMatchId) : null
      });

      localStorage.removeItem('bookingMatchId');

      // Handle required deposit
      if (res && res.requiresDeposit) {
        if (window.confirm(res.message + ' Bạn có muốn thanh toán ngay qua PayOS không?')) {
          const { paymentService } = await import('../../services/paymentService');
          const paymentRes = await paymentService.createPaymentLink({
            type: 'BookingDeposit',
            scheduleId: res.scheduleId
          });
          if (paymentRes && paymentRes.checkoutUrl) {
            window.location.href = paymentRes.checkoutUrl;
          } else {
            alert('Tạo giao dịch thành công (giả lập)!');
            setShowBookingForm(null);
          }
        }
      } else {
        alert('Gửi yêu cầu đặt sân thành công!');
        setShowBookingForm(null);
        setBookingData({ date: '', startTime: '', endTime: '' });
      }
      
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Danh sách Sân thể thao</h2>
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
                  <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <FiMapPin className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />
                    <span className="line-clamp-2">{stadium.address || 'Chưa có địa chỉ'}</span>
                  </div>
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
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedStadium.stadiumName}</h4>
              <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-2"><FiMapPin className="text-rose-500" /> {selectedStadium.address}</p>
              <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-6"><FiPhone className="text-emerald-500" /> {selectedStadium.hotline}</p>
              
              {selectedStadium.description && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <h5 className="font-bold text-slate-800 dark:text-white mb-2">Giới thiệu</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">{selectedStadium.description}</p>
                </div>
              )}

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
                          <span className="block font-bold text-emerald-600">{pitch.pricePerHour?.toLocaleString()} VNĐ/h</span>
                          <button 
                            onClick={() => setShowBookingForm(pitch.pitchId || pitch.id)}
                            className="text-xs text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg mt-2 font-bold shadow-sm"
                          >
                            Đặt Sân
                          </button>
                        </div>
                      </div>
                      
                      {showBookingForm === (pitch.pitchId || pitch.id) && (
                        <form onSubmit={(e) => handleBookPitch(e, pitch.pitchId || pitch.id)} className="bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-xl mt-4 space-y-4">
                          <PitchCalendar 
                            pitchId={pitch.pitchId || pitch.id} 
                            onSelectTimeSlot={(date, time) => {
                              // Automatically set end time to 1.5 hours later
                              const [h, m] = time.split(':').map(Number);
                              const endDate = new Date(new Date(`${date}T${time}:00`).getTime() + 90 * 60000);
                              const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
                              setBookingData({ date, startTime: time, endTime: endTimeStr });
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
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                              <button type="button" onClick={() => setShowBookingForm(null)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                Hủy
                              </button>
                              <button type="submit" disabled={bookingLoading} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-500 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-600 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5">
                                {bookingLoading ? 'Đang gửi...' : 'Xác nhận & Cọc 30%'}
                              </button>
                            </div>
                          </div>
                        </form>
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
  );
}
