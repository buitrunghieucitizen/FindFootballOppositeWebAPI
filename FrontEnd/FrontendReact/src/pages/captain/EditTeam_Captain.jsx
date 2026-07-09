import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiTarget, FiEdit3, FiMapPin, FiFileText, FiShield, FiInfo, FiCheckCircle, FiImage, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { captainService } from '../../services/captainService';
import { mediaService } from '../../services/mediaService';

export default function EditTeam_Captain() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    teamName: '',
    homeArea: '',
    description: '',
    logoUrl: '',
    backgroundUrl: '',
    newLogoFile: null,
    newBgFile: null
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const teamData = await captainService.getMyTeam();
        if (teamData) {
          setEditForm({
            ...teamData,
            description: teamData.description || teamData.history || ''
          });
        } else {
          Swal.fire('Lỗi', 'Không tìm thấy thông tin đội bóng', 'error');
          navigate('/captain-home?tab=overview');
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        Swal.fire('Lỗi', 'Lỗi khi lấy thông tin đội bóng', 'error');
        navigate('/captain-home?tab=overview');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditForm({ ...editForm, logoUrl: previewUrl, newLogoFile: file });
  };

  const handleBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditForm({ ...editForm, backgroundUrl: previewUrl, newBgFile: file });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalLogoUrl = editForm.logoUrl;
      let finalBgUrl = editForm.backgroundUrl;
      
      // Upload new avatar if selected
      if (editForm.newLogoFile) {
        try {
          const uploadRes = await mediaService.uploadImage(editForm.newLogoFile);
          finalLogoUrl = uploadRes.url || uploadRes;
        } catch (uploadErr) {
          console.warn('Upload logo failed, keeping local preview', uploadErr);
        }
      }

      // Upload new background if selected
      if (editForm.newBgFile) {
        try {
          const uploadRes = await mediaService.uploadImage(editForm.newBgFile);
          finalBgUrl = uploadRes.url || uploadRes;
        } catch (uploadErr) {
          console.warn('Upload background failed, keeping local preview', uploadErr);
        }
      }

      const updateData = {
        teamName: editForm.teamName,
        homeArea: editForm.homeArea,
        introduction: editForm.description,
        logoUrl: finalLogoUrl,
        backgroundUrl: finalBgUrl
      };

      await captainService.updateTeam(updateData);
      Swal.fire('Thành công', 'Cập nhật thông tin đội thành công', 'success');
      navigate('/captain-home?tab=overview');
    } catch (error) {
      console.error('Save failed:', error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Lưu thông tin thất bại', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-wc-navy-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 dark:from-wc-navy-900 dark:via-wc-navy-900 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* ── Gradient Hero Header ── */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 dark:shadow-emerald-900/40">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-teal-300/15 rounded-full blur-xl" />

          <div className="relative flex items-center gap-4">
            <button
              onClick={() => navigate('/captain-home?tab=overview')}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <FiArrowLeft size={22} className="text-white" />
            </button>

            <div className="flex items-center gap-3 flex-1">
              {/* Shield Icon Badge */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <FiShield className="text-white text-2xl sm:text-3xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Chỉnh sửa thông tin Đội bóng
                </h1>
                <p className="text-emerald-100/80 text-sm mt-0.5">
                  Cập nhật hồ sơ để đội bóng nổi bật hơn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-white/60 dark:border-slate-700/60 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <form onSubmit={handleSaveEdit} className="space-y-6">

            {/* ── Background & Logo Upload Section ── */}
            <div className="flex flex-col mb-4 gap-4">
              {/* Background Upload — Dramatic tall area */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 overflow-hidden group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-500 shadow-inner">
                {editForm.backgroundUrl ? (
                  <img src={editForm.backgroundUrl} alt="Background" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                    <FiImage className="text-5xl opacity-40" />
                    <span className="text-sm font-medium">Thêm ảnh bìa cho đội bóng</span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">Kích thước khuyến nghị: 1200×400px</span>
                  </div>
                )}
                {/* Gradient overlay on hover */}
                <label className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer backdrop-blur-[1px]">
                  <div className="group-hover:animate-pulse">
                    <FiCamera className="text-4xl mb-3 drop-shadow-lg" />
                  </div>
                  <span className="text-base font-bold drop-shadow-md">Đổi ảnh bìa</span>
                  <span className="text-xs text-white/70 mt-1">Nhấn để chọn ảnh mới</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
                </label>
              </div>

              {/* Logo Upload — Social media profile style overlap */}
              <div className="relative group cursor-pointer mx-auto -mt-20 sm:-mt-24 z-10">
                {/* Glow ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-500" />
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-105 ring-2 ring-emerald-200/50 dark:ring-emerald-700/30">
                  {editForm.logoUrl ? (
                    <img src={editForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <FiTarget className="text-5xl text-emerald-300 dark:text-emerald-600" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/50 backdrop-blur-[2px] text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 rounded-2xl cursor-pointer">
                  <FiCamera className="text-2xl mb-1.5 drop-shadow-md" />
                  <span className="text-xs font-bold text-center leading-tight drop-shadow-md">Đổi logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                {/* Small camera badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform">
                  <FiCamera className="text-white text-sm" />
                </div>
              </div>
            </div>

            {/* ── Form Fields ── */}
            <div className="space-y-5 pt-2">
              {/* Team Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <FiEdit3 className="text-emerald-600 dark:text-emerald-400 text-sm" />
                  </span>
                  Tên đội
                </label>
                <input type="text" required className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={editForm.teamName || ''} onChange={e => setEditForm({...editForm, teamName: e.target.value})} placeholder="Nhập tên đội bóng" />
              </div>

              {/* Home Area */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <FiMapPin className="text-blue-600 dark:text-blue-400 text-sm" />
                  </span>
                  Khu vực (Địa bàn hoạt động)
                </label>
                <input type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={editForm.homeArea || ''} onChange={e => setEditForm({...editForm, homeArea: e.target.value})} placeholder="VD: Quận 1, Hà Nội,..." />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 mb-2.5">
                  <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <FiFileText className="text-purple-600 dark:text-purple-400 text-sm" />
                  </span>
                  Mô tả giới thiệu đội
                </label>
                <textarea className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 resize-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500" rows={4} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Giới thiệu về đội bóng, tiêu chí tham gia, lịch sử, thành tích..."></textarea>
              </div>
            </div>

            {/* ── Tips / Info Section ── */}
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-700/30 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
                  <FiInfo className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-bold text-sm text-amber-800 dark:text-amber-300">Mẹo tạo hồ sơ đội hấp dẫn</span>
              </div>
              <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400/80">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-amber-500 dark:text-amber-500/70 mt-0.5 flex-shrink-0" />
                  <span>Sử dụng ảnh bìa <strong>chất lượng cao</strong> để gây ấn tượng đầu tiên</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-amber-500 dark:text-amber-500/70 mt-0.5 flex-shrink-0" />
                  <span>Logo rõ nét giúp đội bóng <strong>dễ nhận diện</strong> hơn</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiStar className="text-amber-500 dark:text-amber-500/70 mt-0.5 flex-shrink-0" />
                  <span>Mô tả chi tiết về <strong>lịch sử và phong cách thi đấu</strong> sẽ thu hút đối thủ</span>
                </li>
              </ul>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/captain-home?tab=overview')}
                className="flex-1 py-4 rounded-xl font-bold text-base border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 hover:-translate-y-0.5"
              >
                Hủy bỏ
              </button>
              <button disabled={isSaving} type="submit" className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-lg" />
                    Lưu lại thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
