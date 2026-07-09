import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiFileText, FiEdit3, FiSave, FiInfo, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';

export default function EditMatch_Captain() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [editMatchData, setEditMatchData] = useState({ 
    matchType: '',
    matchDate: '', 
    startTime: '', 
    durationMinutes: 90, 
    hasExtraTime: false,
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const matches = await captainService.getMatches();
      const match = matches.find(m => (m.matchId === parseInt(id) || m.id === parseInt(id)));
      
      if (!match) {
        alert('Không tìm thấy trận đấu.');
        navigate('/captain-home?tab=matches');
        return;
      }
      
      setEditMatchData({
        matchType: match.matchType,
        matchDate: match.matchDate ? match.matchDate.split('T')[0] : '',
        startTime: match.startTime ? match.startTime.substring(0,5) : '',
        durationMinutes: match.durationMinutes || 90,
        hasExtraTime: match.hasExtraTime || false,
        location: match.location || '',
        notes: match.notes || ''
      });
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải dữ liệu trận đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMatch = async (e) => {
    e.preventDefault();
    try {
      let formattedStartTime = editMatchData.startTime;
      if (formattedStartTime && formattedStartTime.length === 5) {
        formattedStartTime += ':00';
      }
      
      if (editMatchData.matchType === 'Challenge' || editMatchData.matchType === 'Friendly') {
        await captainService.updateChallenge(parseInt(id), {
          matchDate: editMatchData.matchDate || null,
          startTime: formattedStartTime || null,
          location: editMatchData.location,
          notes: editMatchData.notes
        });
      } else {
        await captainService.updateTournamentMatch(parseInt(id), {
          matchDate: editMatchData.matchDate || null,
          startTime: formattedStartTime || null,
          durationMinutes: parseInt(editMatchData.durationMinutes) || 90,
          hasExtraTime: editMatchData.hasExtraTime,
          location: editMatchData.location
        });
      }
      
      Swal.fire('Thành công', 'Đã cập nhật thông tin trận đấu', 'success');
      navigate('/captain-home?tab=matches');
    } catch (err) {
      Swal.fire('Lỗi', 'Lỗi khi cập nhật trận: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-wc-navy-900 dark:via-slate-900 dark:to-indigo-950 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 dark:border-t-indigo-400"></div>
          <FiEdit3 className="absolute inset-0 m-auto text-indigo-500 dark:text-indigo-400" size={20} />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Đang tải thông tin trận đấu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-wc-navy-900 dark:via-slate-900 dark:to-indigo-950 animate-fade-in">
      
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-700 dark:via-indigo-700 dark:to-violet-700">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/5 rounded-full blur-lg"></div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
          <button 
            onClick={() => navigate('/captain-home?tab=matches')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group"
          >
            <FiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 border border-white/20">
              <FiEdit3 size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Chỉnh sửa Trận Đấu</h1>
              <p className="text-blue-100/80 text-sm mt-0.5">
                {editMatchData.matchType === 'Challenge' ? 'Trận thách đấu' : editMatchData.matchType === 'Friendly' ? 'Trận giao hữu' : 'Trận giải đấu'} #{id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 space-y-5">

        {/* Info Banner */}
        <div className="flex items-start gap-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/40 backdrop-blur-sm rounded-xl px-4 py-3.5">
          <FiInfo className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            Cập nhật thông tin trận đấu bên dưới. Các thay đổi sẽ được áp dụng ngay sau khi lưu và thông báo cho đội đối thủ.
          </p>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-white/60 dark:border-slate-700/60 overflow-hidden">
          {/* Gradient top accent */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>

          <form onSubmit={handleEditMatch} className="p-6 sm:p-8 space-y-6">
            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                  <FiCalendar size={15} className="text-blue-500 dark:text-blue-400" />
                  Ngày thi đấu
                </label>
                <input 
                  type="date" 
                  required 
                  value={editMatchData.matchDate}
                  onChange={e => setEditMatchData({...editMatchData, matchDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500" 
                />
              </div>
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                  <FiClock size={15} className="text-indigo-500 dark:text-indigo-400" />
                  Giờ thi đấu
                </label>
                <input 
                  type="time" 
                  required 
                  value={editMatchData.startTime}
                  onChange={e => setEditMatchData({...editMatchData, startTime: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500" 
                />
              </div>
            </div>
            
            {(editMatchData.matchType === 'Challenge' || editMatchData.matchType === 'Friendly') ? (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                    <FiMapPin size={15} className="text-emerald-500 dark:text-emerald-400" />
                    Địa bàn hoạt động (Khu vực)
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={editMatchData.location}
                    onChange={e => setEditMatchData({...editMatchData, location: e.target.value})}
                    placeholder="Ví dụ: Sân vận động Quận 7, TP.HCM"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500" 
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                    <FiFileText size={15} className="text-amber-500 dark:text-amber-400" />
                    Ghi chú thêm
                  </label>
                  <textarea 
                    rows="4" 
                    value={editMatchData.notes}
                    onChange={e => setEditMatchData({...editMatchData, notes: e.target.value})}
                    placeholder="Thêm ghi chú về trận đấu (không bắt buộc)..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 resize-none transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500" 
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2.5">
                    <FiMapPin size={15} className="text-emerald-500 dark:text-emerald-400" />
                    Địa điểm thi đấu
                  </label>
                  <input 
                    type="text" 
                    value={editMatchData.location}
                    onChange={e => setEditMatchData({...editMatchData, location: e.target.value})}
                    placeholder="Ví dụ: Sân vận động Quận 7, TP.HCM"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500" 
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-900/60 dark:to-indigo-900/20 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <FiClock size={15} className="text-violet-500 dark:text-violet-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Thời lượng:</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        required 
                        className="w-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200" 
                        value={editMatchData.durationMinutes} 
                        onChange={e => setEditMatchData({...editMatchData, durationMinutes: e.target.value})} 
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">phút</span>
                    </div>
                  </div>
                  
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 transition-colors" 
                      checked={editMatchData.hasExtraTime} 
                      onChange={e => setEditMatchData({...editMatchData, hasExtraTime: e.target.checked})} 
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Có hiệp phụ</span>
                  </label>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2"></div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                type="button"
                onClick={() => navigate('/captain-home?tab=matches')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <FiX size={16} />
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <FiSave size={18} />
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>

        {/* Bottom decorative note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
          Trận đấu #{id} · Loại: {editMatchData.matchType === 'Challenge' ? 'Thách đấu' : editMatchData.matchType === 'Friendly' ? 'Giao hữu' : 'Giải đấu'}
        </p>
      </div>
    </div>
  );
}
