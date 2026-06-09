import { useState, useEffect } from 'react';
import { FiTarget, FiCalendar, FiAward, FiStar, FiEdit2, FiCamera } from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { paymentService } from '../../services/paymentService';

export default function OverviewTab() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await captainService.getMyTeam();
        setTeam(data);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        setTeam({
          teamId: 'mock-1',
          teamName: 'FC Thống Nhất',
          qualityLevel: 'Khá',
          homeArea: 'Quận 1, TP.HCM',
          description: 'Đội bóng phong trào tham gia các giải sân 7.',
          logoUrl: 'https://placehold.co/100x100/059669/FFFFFF?text=FCTN'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleUpgrade = async () => {
    try {
      const data = await paymentService.createPaymentLink({ type: 'TeamUpgrade', teamId: team?.teamId });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Có lỗi xảy ra khi tạo link thanh toán (Mô phỏng thành công!)');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến PayOS. Nếu bạn chưa config API Key, hãy giả lập thành công trên Backend.');
    }
  };

  const handleEditClick = () => {
    setEditForm({ ...team });
    setIsEditing(true);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create local object URL for preview immediately
    const previewUrl = URL.createObjectURL(file);
    setEditForm({ ...editForm, logoUrl: previewUrl, newLogoFile: file });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      let finalLogoUrl = editForm.logoUrl;
      
      // Upload new avatar if selected
      if (editForm.newLogoFile) {
        const formData = new FormData();
        formData.append('file', editForm.newLogoFile);
        try {
          const uploadRes = await captainService.uploadMedia(formData);
          finalLogoUrl = uploadRes.url || uploadRes;
        } catch (uploadErr) {
          console.warn('Backend chưa hỗ trợ uploadMedia, giữ nguyên ảnh preview local', uploadErr);
        }
      }

      const updateData = {
        teamName: editForm.teamName,
        qualityLevel: editForm.qualityLevel,
        homeArea: editForm.homeArea,
        introduction: editForm.description,
        logoUrl: finalLogoUrl
      };

      try {
        await captainService.updateTeam(updateData);
      } catch (err) {
        console.warn('Backend chưa hỗ trợ updateTeam, cập nhật giao diện local', err);
      }

      setTeam({ ...team, ...updateData });
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Lưu thông tin thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="animate-fade-in">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Team Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <FiTarget className="text-emerald-500" /> Đội thể thao của bạn
            </h3>
            {team && (
              <div className="flex gap-2">
                <button 
                  onClick={handleEditClick}
                  className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <FiEdit2 /> Chỉnh sửa
                </button>
                <button 
                  onClick={handleUpgrade}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <FiStar /> Nâng cấp
                </button>
              </div>
            )}
          </div>
          {team ? (
            <div className="flex gap-4 items-start">
              {team.logoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-100 shadow-sm">
                  <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2 text-sm flex-1 text-slate-900 dark:text-slate-100">
                <p><strong className="text-black dark:text-white">Tên đội:</strong> {team.teamName}</p>
                <p><strong className="text-black dark:text-white">Cấp độ:</strong> {team.qualityLevel || 'Chưa cập nhật'}</p>
                <p><strong className="text-black dark:text-white">Khu vực:</strong> {team.homeArea || 'Chưa cập nhật'}</p>
                <p><strong className="text-black dark:text-white">Mô tả:</strong> {team.description || team.history || 'Chưa có mô tả'}</p>
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-emerald-100/50">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md"><FiAward /> Fairplay</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md"><FiStar /> Uy Tín</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa tạo hoặc tham gia đội thể thao nào với tư cách đội trưởng.</p>
          )}
        </div>

        {/* Upcoming Matches Empty State */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/40 dark:to-emerald-900/40 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
            <FiCalendar className="text-blue-500" /> Trận Đấu Sắp Tới
          </h3>
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-xl border border-blue-50">
            <FiCalendar className="text-3xl mx-auto mb-2 text-blue-200" />
            <p className="text-sm">Chưa có trận đấu nào sắp tới</p>
          </div>
        </div>
      </div>
      {/* Modal chỉnh sửa */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Chỉnh sửa thông tin Đội bóng</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-100 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                    {editForm.logoUrl ? (
                      <img src={editForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <FiTarget className="text-3xl text-emerald-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                    <FiCamera className="text-xl mb-1" />
                    <span className="text-xs font-bold">Đổi ảnh</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Tên đội</label>
                <input type="text" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={editForm.teamName || ''} onChange={e => setEditForm({...editForm, teamName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Trình độ</label>
                <select className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={editForm.qualityLevel || ''} onChange={e => setEditForm({...editForm, qualityLevel: e.target.value})}>
                  <option value="Mới chơi">Mới chơi</option>
                  <option value="Trung bình yếu">Trung bình yếu</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Trung bình khá">Trung bình khá</option>
                  <option value="Khá">Khá</option>
                  <option value="Bán chuyên">Bán chuyên</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Khu vực</label>
                <input type="text" className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={editForm.homeArea || ''} onChange={e => setEditForm({...editForm, homeArea: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Mô tả</label>
                <textarea className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" rows={3} value={editForm.description || editForm.history || ''} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button disabled={isSaving} onClick={() => setIsEditing(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors disabled:opacity-50">Hủy</button>
              <button disabled={isSaving} onClick={handleSaveEdit} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {isSaving ? 'Đang lưu...' : 'Lưu lại'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

