import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { captainService } from '../../services/captainService';
import { FiPlus, FiCalendar, FiUsers, FiSettings, FiX } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Bóng đá',
    stadium: '',
    format: 'League',
    scope: 'Internal', // Internal (Nội bộ), Public (Mở rộng)
    entryFee: 0,
    maxTeams: 8,
    assignmentType: 'Manual', // Manual, Random
    startDate: '',
    endDate: '',
    agreeTerms: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await captainService.getTournaments();
      setTournaments(data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách giải đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert('Vui lòng đồng ý với các điều khoản trước khi tạo giải đấu.');
      return;
    }
    if (!window.confirm(`Xác nhận tạo giải đấu? Bạn sẽ được chuyển hướng thanh toán (nếu có).`)) return;
    
    try {
      await captainService.createTournament(formData);
      alert('Tạo giải đấu thành công!');
      setShowCreateModal(false);
      fetchTournaments();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể tạo giải đấu'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Quản lý Giải Đấu
        </h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-yellow-500/30 font-bold"
        >
          <FiPlus /> Tạo Giải Mới
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <FaTrophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn chưa tổ chức giải đấu nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                  t.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {t.status === 'Upcoming' ? 'Sắp diễn ra' : t.status === 'Ongoing' ? 'Đang đá' : 'Đã kết thúc'}
                </span>
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  {t.format === 'League' ? 'Đá vòng tròn' :
                   t.format === 'Knockout' ? 'Loại trực tiếp' :
                   t.format === 'DoubleElimination' ? 'Nhánh Thắng/Thua' :
                   t.format === 'GroupStage' ? 'Vòng bảng' :
                   t.format === 'Swiss' ? 'Hệ Thụy Sĩ' : t.format}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{t.name}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiCalendar className="mr-2 text-slate-400" />
                  Thời gian: {t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'} {t.endDate ? ` - ${new Date(t.endDate).toLocaleDateString('vi-VN')}` : ''}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiUsers className="mr-2 text-slate-400" />
                  Số đội: {Array.isArray(t.teams) ? t.teams.length : (t.teams || 0)}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiCalendar className="mr-2 text-slate-400" />
                  Lệ phí: {(t.entryFee || t.fee || 0).toLocaleString()} VNĐ
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/captain/tournaments/${t.id || t.tournamentId}/manage`)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
              >
                Quản lý giải
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO GIẢI ĐẤU */}
      {showCreateModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="min-h-full flex items-start justify-center p-4 py-8 sm:py-12">
            <div 
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-3xl">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" /> Khởi tạo Giải Đấu
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên Giải Đấu</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-medium transition-all"
                      placeholder="VD: Siêu Cúp Mùa Hè 2026"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn thể thao</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={formData.sport}
                        onChange={e => setFormData({...formData, sport: e.target.value})}
                      >
                        <option value="Bóng đá">Bóng đá</option>
                        <option value="Bóng rổ">Bóng rổ</option>
                        <option value="Cầu lông">Cầu lông</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Bóng chuyền">Bóng chuyền</option>
                        <option value="E-Sports">E-Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân thi đấu</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-medium transition-all"
                        placeholder="VD: Sân Chảo Lửa (để trống nếu chưa xác định)"
                        value={formData.stadium}
                        onChange={e => setFormData({...formData, stadium: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày bắt đầu</label>
                      <input 
                        type="date"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-medium transition-all"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày kết thúc dự kiến</label>
                      <input 
                        type="date"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-medium transition-all"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thể thức thi đấu</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={formData.format}
                        onChange={e => setFormData({...formData, format: e.target.value})}
                      >
                        <option value="League">Đá vòng tròn (League)</option>
                        <option value="Knockout">Loại trực tiếp (Single Elimination)</option>
                        <option value="DoubleElimination">Nhánh Thắng/Thua (Double Elimination)</option>
                        <option value="GroupStage">Vòng bảng (Group Stage)</option>
                        <option value="Swiss" disabled={formData.maxTeams < 8}>Hệ Thụy Sĩ (Swiss) - Yêu cầu ≥ 8 đội</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số đội tối đa</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={formData.maxTeams}
                        onChange={e => {
                          const newMax = Number(e.target.value);
                          const newFormat = (newMax < 8 && formData.format === 'Swiss') ? 'League' : formData.format;
                          setFormData({...formData, maxTeams: newMax, format: newFormat});
                        }}
                      >
                        <option value={4}>4 đội</option>
                        <option value={8}>8 đội</option>
                        <option value={16}>16 đội</option>
                        <option value={32}>32 đội</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quy mô giải đấu</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={formData.scope}
                        onChange={e => setFormData({...formData, scope: e.target.value})}
                      >
                        <option value="Internal">Giải Nội Bộ (Chỉ mời)</option>
                        <option value="Public">Giải Mở Rộng (Cho toàn hệ thống)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cơ chế xếp lịch</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                        value={formData.assignmentType}
                        onChange={e => setFormData({...formData, assignmentType: e.target.value})}
                      >
                        <option value="Manual">Tự xếp đội / Bốc thăm tay</option>
                        <option value="Random">Hệ thống random bốc thăm</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phí tạo giải (VNĐ)</label>
                      <input 
                        type="number" 
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium outline-none cursor-not-allowed transition-all"
                        value={0}
                      />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Hệ thống đang miễn phí tạo giải đấu trong thời gian này!</p>
                    </div>
                  </div>

                </div>

                {/* <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                  <FiSettings className="text-yellow-600 mt-1 shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Lưu ý:</strong> Nền tảng sẽ thu phí <strong>{formData.entryFee.toLocaleString()} VNĐ</strong> để khởi tạo giải đấu này. Bạn sẽ thanh toán qua cổng PayOS sau khi xác nhận.
                  </div>
                </div> */}

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500"
                      checked={formData.agreeTerms}
                      onChange={e => setFormData({...formData, agreeTerms: e.target.checked})}
                    />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">NÓI KHÔNG VỚI CÁ ĐỘ BÓNG ĐÁ, VÌ 1 NỀN TẢNG TRONG SẠCH, HÃY LÀ NGƯỜI CHƠI THỂ THAO CHÂN CHÍNH</p>
                      <p>Nền tảng sẽ không chịu trách nhiệm cho tất cả hoạt động liên quan đến cá độ trong giải đấu, nếu nền tảng phát hiện ra giải đấu có dấu hiệu cá độ, dàn xếp tỉ số, những người liên quan sẽ phải chịu trách nhiệm trước pháp luật.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:-translate-y-0.5 transition-all"
                  >
                    Tạo Giải Đấu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
