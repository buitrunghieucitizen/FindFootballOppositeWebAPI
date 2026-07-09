import { useState, useRef, useEffect } from 'react';
import { FiUsers, FiMapPin, FiShield, FiFileText, FiAward, FiAlertCircle, FiCamera, FiLoader } from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { publicService } from '../../services/publicService';
import { mediaService } from '../../services/mediaService';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '../../components';

export default function CreateTeamTab({ onTeamCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    homeArea: '',
    introduction: '',
    isClubOwner: false,
    logoUrl: '',
    backgroundUrl: '',
    sportId: 1
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessNote, setShowSuccessNote] = useState(false);
  const [sports, setSports] = useState([]);
  const fileInputRef = useRef(null);

  const maxMembers = user?.isPremium ? 30 : 15;

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await publicService.getSports();
        setSports(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách môn thể thao", err);
      }
    };
    fetchSports();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    
    try {
      const res = await mediaService.uploadImage(file);
      setFormData(prev => ({ ...prev, [type]: res.url || res }));
    } catch (err) {
      setError('Lỗi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName) {
      setError('Tên đội thể thao không được để trống.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await captainService.createTeam(formData);
      // Wait for user to acknowledge the role change
      setShowSuccessNote(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo đội thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
          <FiShield className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tạo đội thể thao Mới</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Bước đầu tiên để chinh phục các giải đấu là tạo cho mình một đội thể thao.</p>
      </div>

      <Alert type="info" message="Bạn hiện không quản lý đội bóng nào (có thể do bạn chưa tạo, hoặc vừa chuyển quyền Đội trưởng cho người khác). Vui lòng tạo một đội mới để tiếp tục sử dụng Captain Panel." className="mb-6" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700/60">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Background Upload */}
          <div className="flex flex-col mb-6 gap-4">
            <div className="relative w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden transition-all hover:border-emerald-500 group">
              {formData.backgroundUrl ? (
                <img src={formData.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
              ) : uploadingImage ? (
                <FiLoader className="text-3xl text-emerald-500 animate-spin" />
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <FiCamera className="text-3xl mb-1" />
                  <span className="text-xs font-bold uppercase">Ảnh bìa (Tùy chọn)</span>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'backgroundUrl')} 
              />
            </div>

            {/* Logo Upload */}
            <div className="relative group mx-auto -mt-12 z-10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-md relative">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : uploadingImage ? (
                  <FiLoader className="text-2xl text-emerald-500 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <FiShield className="text-2xl mb-1" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white">
                  <FiCamera className="text-xl mb-1" />
                  <span className="text-[10px] font-bold text-center leading-tight">Đổi<br/>logo</span>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'logoUrl')} 
                />
              </div>
            </div>
          </div>
          
          {/* Vai trò */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">Vai trò của bạn trong đội</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${!formData.isClubOwner ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20/50 text-emerald-700' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:border-emerald-800 text-slate-600 dark:text-slate-300'}`}>
                <input type="radio" name="isClubOwner" className="hidden" checked={!formData.isClubOwner} onChange={() => setFormData(p => ({...p, isClubOwner: false}))} />
                <FiAward className="text-lg" /> Đội Trưởng
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.isClubOwner ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20/50 text-amber-700' : 'border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:border-amber-800 text-slate-600 dark:text-slate-300'}`}>
                <input type="radio" name="isClubOwner" className="hidden" checked={formData.isClubOwner} onChange={() => setFormData(p => ({...p, isClubOwner: true}))} />
                <FiShield className="text-lg" /> Chủ CLB
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">Chủ CLB thường quản lý tài chính và định hướng, Đội Trưởng dẫn dắt chuyên môn.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Tên đội thể thao <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUsers className="text-slate-400" />
              </div>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="VD: FC Rồng Lửa"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Môn thể thao <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiAward className="text-slate-400" />
              </div>
              <select
                name="sportId"
                value={formData.sportId}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
              >
                {sports.map(sport => (
                  <option key={sport.sportId} value={sport.sportId}>{sport.sportName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Khu vực hoạt động</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMapPin className="text-slate-400" />
              </div>
              <input
                type="text"
                name="homeArea"
                value={formData.homeArea}
                onChange={handleChange}
                placeholder="VD: Quận Cầu Giấy, Hà Nội"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Giới thiệu chung</label>
            <div className="relative">
              <div className="absolute top-3 left-4 pointer-events-none">
                <FiFileText className="text-slate-400" />
              </div>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                placeholder="Mô tả về đội thể thao, phong cách đá, thời gian hay đá..."
                rows="4"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              ></textarea>
            </div>
          </div>

          {/* Premium Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <FiAlertCircle className="text-blue-500 text-xl shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-bold mb-1">Quy mô đội thể thao</p>
              <p className="text-xs text-blue-700">
                Tài khoản của bạn đang là {user?.isPremium ? <strong className="text-indigo-600">Premium</strong> : <strong>Cơ bản</strong>}. 
                Bạn có thể tuyển tối đa <strong>{maxMembers} thành viên</strong>.
                {!user?.isPremium && ' Nâng cấp tài khoản để mở rộng đội hình lên tới 30 người và mở khóa các tính năng phân tích đối thủ.'}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70"
          >
            {loading ? 'Đang tạo...' : 'Tạo đội thể thao'}
          </button>
        </form>
      </div>

      {showSuccessNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tạo đội thành công! 🎉</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
              Chúc mừng bạn đã tạo đội thành công. Vai trò của bạn hiện tại sẽ được tự động chuyển thành <strong className="text-emerald-600">Đội Trưởng (Captain)</strong> hoặc Chủ CLB để quản lý các tính năng của đội.
            </p>
            <button
              onClick={() => onTeamCreated && onTeamCreated()}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Tôi đã hiểu & Quản lý đội ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

