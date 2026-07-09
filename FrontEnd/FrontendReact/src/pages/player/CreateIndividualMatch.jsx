import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiAward, FiCheckCircle } from 'react-icons/fi';
import playerService from '../../services/playerService';
import { publicService } from '../../services/publicService';
import Swal from 'sweetalert2';

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
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!matchData.sportId || !matchData.matchDate || !matchData.startTime) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ môn, ngày và giờ.', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const data = {
        ...matchData,
        stadiumId: selectedStadium ? selectedStadium.stadiumId : null,
        location: selectedStadium ? selectedStadium.stadiumName : matchData.location
      };
      
      await playerService.createIndividualMatch(data);
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
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn thể thao</label>
              <select 
                value={matchData.sportId} 
                onChange={(e) => setMatchData({...matchData, sportId: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Chọn môn</option>
                {sports.map(s => <option key={s.sportId} value={s.sportId}>{s.sportName}</option>)}
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
              onClick={() => setSelectedStadium(null)}
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
                onClick={() => setSelectedStadium(stadium)}
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
    </div>
  );
}
