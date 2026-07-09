import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';

export default function CreateTournament_Captain() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sport: 'Bóng đá',
    stadium: '',
    format: 'League',
    scope: 'Public',
    maxTeams: 8,
    assignmentType: 'Manual',
    startDate: '',
    endDate: '',
    agreeTerms: false,
    organizerCccd: '',
    organizerDriverLicense: '',
    entryFee: 0,
    bankQrCodeUrl: ''
  });

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const uploadUrl = import.meta.env.DEV ? 'http://localhost:5229/api/Media/Upload' : '/api/Media/Upload';
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formDataUpload
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({...prev, bankQrCodeUrl: data.url}));
    } catch (err) {
      alert('Lỗi tải ảnh lên: ' + err.message);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      Swal.fire('Chú ý', 'Vui lòng đồng ý với các điều khoản trước khi tạo giải đấu.', 'warning');
      return;
    }
    
    const confirm = await Swal.fire({
      title: 'Xác nhận tạo giải đấu?',
      text: 'Bạn sẽ được chuyển hướng thanh toán (nếu có).',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (!confirm.isConfirmed) return;
    
    try {
      const payload = {
        ...formData,
        entryFee: formData.maxTeams === 4 ? 0 : (formData.maxTeams === 8 ? 130000 : formData.maxTeams === 16 ? 200000 : 500000)
      };
      await captainService.createTournament(payload);
      Swal.fire('Thành công', 'Tạo giải đấu thành công! Vui lòng chờ admin duyệt.', 'success');
      navigate('/captain-home?tab=tournaments');
    } catch (err) {
      Swal.fire('Lỗi', (err.response?.data?.message || err.message || 'Không thể tạo giải đấu'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/captain-home?tab=tournaments')}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <FiArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Khởi tạo Giải Đấu
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Bước 1: Chọn quy mô giải đấu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { teams: 4, fee: 0, label: '4 đội (Miễn phí)' },
                    { teams: 8, fee: 130000, label: '8 đội (Phí: 130.000đ)' },
                    { teams: 16, fee: 200000, label: '16 đội (Phí: 200.000đ)' },
                    { teams: 32, fee: 500000, label: '32 đội (Phí: 500.000đ)' }
                  ].map(pkg => (
                    <div 
                      key={pkg.teams}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.maxTeams === pkg.teams ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-yellow-300'}`}
                      onClick={() => setFormData({...formData, maxTeams: pkg.teams})}
                    >
                      <div className="font-bold text-xl text-slate-800 dark:text-white">{pkg.label}</div>
                      <div className="text-sm text-slate-500 mt-2">Phù hợp cho giải {pkg.teams} đội đá</div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                  <button type="button" onClick={() => navigate('/captain-home?tab=tournaments')} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Hủy bỏ</button>
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Tiếp tục</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Bước 2: Thông tin giải đấu</h4>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên Giải Đấu</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn thể thao</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value})}>
                      <option value="Bóng đá">Bóng đá</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân thi đấu</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.stadium} onChange={e => setFormData({...formData, stadium: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày bắt đầu</label>
                    <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày kết thúc</label>
                    <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thể thức thi đấu</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                      <option value="League">Đá vòng tròn (League)</option>
                      <option value="Knockout">Loại trực tiếp (Single Elimination)</option>
                      <option value="DoubleElimination">Nhánh Thắng/Thua (Double Elimination)</option>
                      <option value="GroupStage">Vòng bảng (Group Stage)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cơ chế xếp lịch</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow" value={formData.assignmentType} onChange={e => setFormData({...formData, assignmentType: e.target.value})}>
                      <option value="Manual">Tự xếp đội / Bốc thăm tay</option>
                      <option value="Random">Hệ thống random bốc thăm</option>
                    </select>
                  </div>
                </div>
                {formData.scope !== 'Internal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lệ phí tham dự (VNĐ/Đội)</label>
                      <input type="number" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-shadow" value={formData.entryFee} onChange={e => setFormData({...formData, entryFee: Number(e.target.value)})} placeholder="Ví dụ: 500000" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ảnh QR Ngân hàng (Để các đội đóng phí)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-shrink-0 cursor-pointer px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors shadow-sm">
                          {uploadingQr ? 'Đang tải...' : 'Tải ảnh lên'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={uploadingQr} />
                        </label>
                        {formData.bankQrCodeUrl && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                            <img src={formData.bankQrCodeUrl} alt="QR Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setFormData({...formData, bankQrCodeUrl: ''})} className="absolute top-0 right-0 bg-rose-500 text-white rounded-bl-lg p-1" title="Xóa">
                              <FiX size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Quay lại</button>
                  <button type="button" onClick={() => { if(!formData.name || !formData.startDate || !formData.endDate) Swal.fire('Lỗi', 'Vui lòng điền đủ thông tin', 'warning'); else setStep(3); }} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Tiếp tục</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Bước 3: Cung cấp thông tin xác thực</h4>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl text-amber-800 dark:text-amber-200 text-sm mb-6 border border-amber-200 dark:border-amber-900/50">
                  Để đảm bảo tính minh bạch, vui lòng cung cấp mã số CCCD và Bằng lái xe của người chịu trách nhiệm giải đấu.
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số CCCD (Bắt buộc)</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow focus:ring-2 focus:ring-yellow-500" value={formData.organizerCccd} onChange={e => setFormData({...formData, organizerCccd: e.target.value})} placeholder="Nhập 12 số CCCD" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số Bằng lái xe (Tùy chọn)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-shadow focus:ring-2 focus:ring-yellow-500" value={formData.organizerDriverLicense} onChange={e => setFormData({...formData, organizerDriverLicense: e.target.value})} placeholder="Nhập số giấy phép lái xe" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mt-6 shadow-sm">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-6 h-6 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500 bg-white dark:bg-slate-900" checked={formData.agreeTerms} onChange={e => setFormData({...formData, agreeTerms: e.target.checked})} />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-rose-600 dark:text-rose-400 mb-2">NÓI KHÔNG VỚI CÁ ĐỘ BÓNG ĐÁ, VÌ 1 NỀN TẢNG TRONG SẠCH, HÃY LÀ NGƯỜI CHƠI THỂ THAO CHÂN CHÍNH</p>
                      <p className="leading-relaxed">Nền tảng sẽ không chịu trách nhiệm cho tất cả hoạt động liên quan đến cá độ trong giải đấu, nếu nền tảng phát hiện ra giải đấu có dấu hiệu cá độ, dàn xếp tỉ số, những người liên quan sẽ phải chịu trách nhiệm trước pháp luật.</p>
                    </div>
                  </label>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-8">
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">Quay lại</button>
                  <button type="submit" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Gửi yêu cầu duyệt</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
