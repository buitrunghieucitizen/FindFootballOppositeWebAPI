import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiAward, FiCheckCircle } from 'react-icons/fi';
import playerService from '../../services/playerService';
import { publicService } from '../../services/publicService';
import Swal from 'sweetalert2';
import PitchCalendar from '../../components/PitchCalendar';

export default function CreateIndividualMatch({ onSuccess, sports }) {
  const [step, setStep] = useState(1);
  const [matchData, setMatchData] = useState({
    sportId: '',
    matchDate: '',
    startTime: '',
    duration: 60,
    matchType: 'Friendly',
    location: '',
    description: ''
  });

  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [stadiumDetails, setStadiumDetails] = useState(null);
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('pay_later');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(1);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      loadStadiums();
    }
  }, [step]);

  const loadStadiums = async () => {
    try {
      const res = await publicService.getStadiums(matchData.sportId ? { sportId: matchData.sportId } : {});
      setStadiums(res.data || res.$values || res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStadiumDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const res = await publicService.getStadiumDetails(id);
      setStadiumDetails(res.data || res);
    } catch (err) {
      console.error('Lỗi lấy chi tiết sân', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectStadium = async (stadium) => {
    setSelectedStadium(stadium);
    setSelectedPitch(null);
    if (stadium) {
      await loadStadiumDetails(stadium.stadiumId);
    } else {
      setStadiumDetails(null);
    }
  };

  const handleCreate = async () => {
    if (!matchData.sportId || !matchData.matchDate || !matchData.startTime) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ môn, ngày và giờ.', 'error');
      return;
    }
    
    try {
      setLoading(true);
      let formattedStartTime = matchData.startTime;
      if (formattedStartTime && formattedStartTime.length === 5) {
        formattedStartTime += ':00';
      }

      const locationName = selectedStadium ? selectedStadium.stadiumName : matchData.location;

      const data = {
        ...matchData,
        startTime: formattedStartTime,
        stadiumId: selectedStadium ? selectedStadium.stadiumId : null,
        location: locationName
      };
      
      const createRes = await playerService.createIndividualMatch(data);
      const matchIdCreated = createRes.matchId || createRes.MatchId || createRes.id;

      if (selectedStadium && selectedPitch) {
        const startDateTime = `${matchData.matchDate}T${matchData.startTime}:00`;
        const [h, m] = matchData.startTime.split(':').map(Number);
        let totalMins = h * 60 + m + 90;
        let endH = Math.floor(totalMins / 60) % 24;
        let endM = totalMins % 60;
        const endDateTime = `${matchData.matchDate}T${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;

        await playerService.bookPitch({
          PitchId: selectedPitch.pitchId || selectedPitch.id,
          StartTime: startDateTime,
          EndTime: endDateTime,
          MatchId: parseInt(matchIdCreated),
          BookingType: paymentMethod,
          NumberOfWeeks: isRecurring ? parseInt(recurringWeeks) : 1
        });
      }

      if (selectedStadium && selectedPitch && paymentMethod === 'chuyen_khoan') {
        setLoading(false);
        setShowPaywallModal(true);
        return;
      }

      Swal.fire('Thành công', 'Đã tạo kèo cá nhân và đang tìm đối thủ!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tạo kèo cá nhân</h2>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700">
            <div className={`h-full ${step > 1 ? 'bg-indigo-600' : ''}`}></div>
          </div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn thể thao (Cá nhân)</label>
              <select 
                value={matchData.sportId} 
                onChange={(e) => setMatchData({...matchData, sportId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Chọn môn cá nhân</option>
                {sports
                  .filter(s => {
                    const name = s.sportName.toLowerCase();
                    return !name.includes('bóng đá') && !name.includes('bóng rổ') && !name.includes('bóng chuyền');
                  })
                  .map(s => <option key={s.sportId} value={s.sportId}>{s.sportName}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày thi đấu</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="date" 
                  value={matchData.matchDate}
                  onChange={(e) => setMatchData({...matchData, matchDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Giờ bắt đầu</label>
              <div className="relative">
                <FiClock className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="time" 
                  value={matchData.startTime}
                  onChange={(e) => setMatchData({...matchData, startTime: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thời lượng (phút)</label>
              <input 
                type="number" 
                value={matchData.duration}
                onChange={(e) => setMatchData({...matchData, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả / Lời nhắn</label>
            <textarea 
              placeholder="VD: Cần tìm đối thủ ngang trình, đánh giao lưu..."
              value={matchData.description}
              onChange={(e) => setMatchData({...matchData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                if(!matchData.sportId || !matchData.matchDate || !matchData.startTime) {
                  Swal.fire('Lỗi', 'Vui lòng điền đủ Môn, Ngày và Giờ bắt đầu', 'warning');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              Tiếp tục <FiAward />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 p-4 rounded-xl text-sm font-semibold flex items-start gap-3">
            <FiMapPin className="mt-0.5 text-lg" />
            <div>
              Bạn có thể chọn đặt sân trực tiếp trên hệ thống để được xác nhận nhanh nhất, hoặc chọn <b>Không đặt / Sân ngoài</b> nếu bạn đã có sẵn địa điểm.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
            <div 
              onClick={() => handleSelectStadium(null)}
              className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                selectedStadium === null 
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <FiMapPin className="text-2xl text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">Không / Đã có sân ngoài</h4>
              <p className="text-xs text-slate-500 mb-4">Tự điền địa điểm bên dưới</p>
              {selectedStadium === null && <FiCheckCircle className="text-indigo-600 text-2xl" />}
            </div>

            {stadiums.map(stadium => (
              <div 
                key={stadium.stadiumId}
                onClick={() => handleSelectStadium(stadium)}
                className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden ${
                  selectedStadium?.stadiumId === stadium.stadiumId 
                  ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
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
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <FiCheckCircle />
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedStadium && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <FiMapPin className="text-indigo-600" />
                Chọn Sân bóng tại {selectedStadium.stadiumName}
              </h3>
              
              {detailsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {stadiumDetails?.pitches?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {stadiumDetails.pitches.map(pitch => (
                        <div 
                          key={pitch.pitchId || pitch.id}
                          onClick={() => setSelectedPitch(pitch)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPitch?.pitchId === pitch.pitchId || selectedPitch?.id === pitch.id 
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          <div className="font-bold text-slate-800 dark:text-white text-sm">{pitch.pitchName}</div>
                          <div className="text-xs text-slate-500 mt-1">Sân {pitch.pitchSize} người</div>
                          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                            {pitch.pricePerSlot?.toLocaleString() || 0}đ / ca
                          </div>
                        </div>
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
                          setMatchData({...matchData, matchDate: date, startTime: time});
                        }} 
                      />
                      {matchData.matchDate && matchData.startTime && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 font-bold flex items-center justify-center gap-2">
                          <FiCheckCircle size={18} />
                          Đã chọn: Ngày {new Date(matchData.matchDate).toLocaleDateString('vi-VN')} lúc {matchData.startTime}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {matchData.matchDate && matchData.startTime && selectedPitch && (
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

          {selectedStadium === null && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Địa điểm thi đấu (Nếu có)</label>
              <input 
                type="text" 
                placeholder="VD: Sân Tennis Kỳ Hòa..."
                value={matchData.location}
                onChange={(e) => setMatchData({...matchData, location: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors"
            >
              Quay lại
            </button>
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất & Đăng'}
            </button>
          </div>
        </div>
      )}
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
              if (onSuccess) onSuccess();
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
