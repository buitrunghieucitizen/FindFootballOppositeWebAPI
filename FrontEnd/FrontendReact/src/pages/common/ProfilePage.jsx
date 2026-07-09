import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import {
  FiUser, FiLock, FiEdit2, FiSave, FiX, FiHome, FiLogOut,
  FiChevronRight, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiArrowLeft, FiSun, FiMoon, FiCamera
} from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { useTheme } from '../../contexts/ThemeContext';

const roleThemes = {
  Admin: {
    gradient: 'from-violet-500 to-fuchsia-600',
    gradientSoft: 'from-violet-500/20 to-fuchsia-600/10',
    text: 'text-violet-500',
    textDark: 'text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    shadow: 'shadow-violet-500/30',
    shadowSoft: 'shadow-violet-500/5',
    focusRing: 'focus:ring-violet-500/20 focus:border-violet-500',
    btnGradient: 'from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700',
    btnShadow: 'shadow-violet-500/25',
    indicator: 'bg-gradient-to-b from-violet-400 to-fuchsia-500',
    label: 'Admin Panel',
    panelLabel: 'Quản trị viên',
    homeLink: '/admin-dashboard',
  },
  Captain: {
    gradient: 'from-amber-400 to-orange-500',
    gradientSoft: 'from-amber-500/20 to-orange-500/10',
    text: 'text-orange-500',
    textDark: 'text-orange-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    shadow: 'shadow-amber-500/30',
    shadowSoft: 'shadow-amber-500/5',
    focusRing: 'focus:ring-amber-500/20 focus:border-amber-500',
    btnGradient: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    btnShadow: 'shadow-amber-500/25',
    indicator: 'bg-gradient-to-b from-amber-400 to-orange-500',
    label: 'Captain Panel',
    panelLabel: 'Đội trưởng',
    homeLink: '/captain-dashboard',
  },
  StadiumOwner: {
    gradient: 'from-blue-500 to-indigo-600',
    gradientSoft: 'from-blue-500/20 to-indigo-600/10',
    text: 'text-blue-500',
    textDark: 'text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    shadow: 'shadow-blue-500/30',
    shadowSoft: 'shadow-blue-500/5',
    focusRing: 'focus:ring-blue-500/20 focus:border-blue-500',
    btnGradient: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    btnShadow: 'shadow-blue-500/25',
    indicator: 'bg-gradient-to-b from-blue-400 to-indigo-500',
    label: 'Stadium Owner',
    panelLabel: 'Chủ sân',
    homeLink: '/stadium-owner-dashboard',
  },
  Player: {
    gradient: 'from-emerald-400 to-emerald-600',
    gradientSoft: 'from-emerald-500/20 to-emerald-600/10',
    text: 'text-emerald-600',
    textDark: 'text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    shadow: 'shadow-emerald-500/30',
    shadowSoft: 'shadow-emerald-500/5',
    focusRing: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    btnGradient: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    btnShadow: 'shadow-emerald-500/25',
    indicator: 'bg-gradient-to-b from-emerald-400 to-emerald-500',
    label: 'Player Panel',
    panelLabel: 'Cầu thủ',
    homeLink: '/player-home',
  },
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordErrors, setPasswordErrors] = useState({});

  const role = user?.role || 'Player';
  const theme = roleThemes[role] || roleThemes.Player;

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userProfileService.getProfile();
      setProfile(data);
      setEditForm({ fullName: data.fullName || '', phone: data.phone || '' });
    } catch (err) {
      console.error('Failed to load profile:', err);
      const mockProfile = {
        fullName: user?.username || 'Chưa cập nhật',
        phone: 'Chưa cập nhật',
        email: 'user@example.com'
      };
      setProfile(mockProfile);
      setEditForm({ fullName: mockProfile.fullName, phone: mockProfile.phone });
      setProfileMsg({ type: 'error', text: 'Lỗi máy chủ (500). Đang hiển thị dữ liệu tạm thời.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await userProfileService.updateProfile(editForm);
      setProfile((prev) => ({ ...prev, ...editForm }));
      setIsEditing(false);
      setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Cập nhật thất bại. Vui lòng thử lại.';
      setProfileMsg({ type: 'error', text: typeof msg === 'string' ? msg : 'Cập nhật thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ fullName: profile?.fullName || '', phone: profile?.phone || '', avatarUrl: profile?.avatarUrl || '' });
    setIsEditing(false);
    setProfileMsg({ type: '', text: '' });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      let newAvatarUrl;
      try {
        const uploadRes = await captainService.uploadMedia(formData);
        newAvatarUrl = uploadRes.url || uploadRes;
      } catch (uploadErr) {
        console.warn('Backend chưa hỗ trợ uploadMedia, tạo preview local', uploadErr);
        newAvatarUrl = URL.createObjectURL(file);
      }

      const updateData = { ...editForm, avatarUrl: newAvatarUrl };
      setEditForm(updateData);
      
      try {
        await userProfileService.updateProfile(updateData);
        setProfile({ ...profile, avatarUrl: newAvatarUrl });
        setProfileMsg({ type: 'success', text: 'Cập nhật avatar thành công!' });
      } catch (updateErr) {
        console.warn('Backend chưa hỗ trợ update avatar, cập nhật giao diện local', updateErr);
        setProfile({ ...profile, avatarUrl: newAvatarUrl });
      }
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: 'Tải ảnh lên thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  // Password validation
  const validatePassword = (form) => {
    const errors = {};
    if (!form.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!form.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      if (form.newPassword.length < 8) errors.newPassword = 'Tối thiểu 8 ký tự';
      else if (!/[A-Z]/.test(form.newPassword)) errors.newPassword = 'Cần ít nhất 1 chữ hoa';
      else if (!/[a-z]/.test(form.newPassword)) errors.newPassword = 'Cần ít nhất 1 chữ thường';
      else if (!/[0-9]/.test(form.newPassword)) errors.newPassword = 'Cần ít nhất 1 chữ số';
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    return errors;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: 'Yếu', color: 'bg-red-500' };
    if (score <= 3) return { level: 2, label: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 4) return { level: 3, label: 'Khá', color: 'bg-blue-500' };
    return { level: 4, label: 'Mạnh', color: 'bg-emerald-500' };
  };

  const handleChangePassword = async () => {
    const errors = validatePassword(passwordForm);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await userProfileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Đổi mật khẩu thất bại.';
      setPasswordMsg({ type: 'error', text: typeof msg === 'string' ? msg : 'Đổi mật khẩu thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: FiUser },
    { id: 'password', label: 'Đổi Mật Khẩu', icon: FiLock },
  ];

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${role === 'Player' ? 'font-sans pb-20 block' : 'flex'}`}>
      
      {role === 'Player' && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto no-scrollbar">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setProfileMsg({ type: '', text: '' }); setPasswordMsg({ type: '', text: '' }); }}
                    className={`py-4 px-2 border-b-2 font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
 active 
 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
 : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white dark:hover:text-white hover:border-slate-300 dark:border-slate-600'
 }`}
                  >
                    <Icon className="text-lg" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      {role !== 'Player' && (
      <aside className="w-[280px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto z-40">
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-2 mb-1">
            <div className="h-16 w-auto flex items-start">
              <img src="/favicon.png" alt="SportifyX Logo" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className={`block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-1`}>{theme.label}</span>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 mb-4 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {profile?.avatarUrl ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-emerald-100 dark:border-slate-700">
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {getInitials(profile?.fullName || user?.username || 'U')}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{profile?.fullName || user?.username || 'Người dùng'}</p>
                <span className={`inline-block px-2 py-0.5 ${theme.bg} ${theme.textDark} dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider border ${theme.border} dark:border-emerald-500/20 mt-1`}>
                  {theme.panelLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3 px-3">Tài Khoản</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setProfileMsg({ type: '', text: '' }); setPasswordMsg({ type: '', text: '' }); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative
                    ${active
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800'
                    }`}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-500 rounded-r-full" />}
                  <Icon className={`text-lg ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {active && <FiChevronRight className="ml-auto text-emerald-500 text-sm" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 mt-auto space-y-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={theme.homeLink}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all"
          >
            <FiHome className="text-lg" /> Về Bảng Điều Khiển
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:bg-rose-900/20 dark:hover:bg-rose-500/10 rounded-xl font-semibold text-sm transition-all"
          >
            <FiLogOut className="text-lg" /> Đăng Xuất
          </button>
        </div>
      </aside>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className={`${role === 'Player' ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full' : 'flex-1 p-8'} overflow-x-hidden relative`}>
        {role !== 'Player' && (
          <div className={`absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500 opacity-[0.05] dark:opacity-[0.03] rounded-full blur-[100px] pointer-events-none`} />
        )}

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(theme.homeLink)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:${theme.text} hover:${theme.bg} transition-colors border border-slate-200 dark:border-slate-700 hover:border-transparent font-semibold text-sm shadow-sm`}
              title="Quay lại"
            >
              <FiArrowLeft className="text-xl" /> Về Bảng điều khiển
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                {activeTab === 'profile' ? 'Hồ Sơ Cá Nhân' : 'Đổi Mật Khẩu'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeTab === 'profile' ? 'Xem và chỉnh sửa thông tin cá nhân' : 'Cập nhật mật khẩu tài khoản'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
        <div className={`w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-4 animate-spin`} style={{ borderTopColor: '#10b981' }} />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang tải...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ===== PROFILE TAB ===== */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in">
                  {/* Message */}
                  {profileMsg.text && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium
 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 border border-red-200 dark:border-red-800'}`}>
                      {profileMsg.type === 'success' ? <FiCheck className="text-lg shrink-0" /> : <FiAlertCircle className="text-lg shrink-0" />}
                      {profileMsg.text}
                    </div>
                  )}

                  <div className="max-w-2xl mx-auto">
                    {/* Avatar & Basic Info Card */}
                    <div className="text-center mb-8">
                      <div className="relative inline-block group cursor-pointer mx-auto mb-4">
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center font-bold text-3xl shadow-xl ${theme.btnShadow} overflow-hidden`}>
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(profile?.fullName || user?.username || 'U')
                          )}
                        </div>
                        <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer backdrop-blur-sm">
                          <FiCamera className="text-xl mb-1" />
                          <span className="text-xs font-bold">Đổi ảnh</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={saving} />
                        </label>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{profile?.fullName || user?.username || 'Người dùng'}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">@{profile?.username || user?.username}</p>
                      <span className={`inline-block px-3 py-1 ${theme.bg} ${theme.textDark} rounded-lg text-xs font-bold uppercase tracking-wider ${theme.border} border mt-2`}>
                        {theme.panelLabel}
                      </span>
                      {profile?.createdAt && (
                        <p className="text-xs text-slate-400 mt-2">
                          Thành viên từ: {new Date(profile.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Profile Details / Edit Form */}
                    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Thông tin chi tiết</h3>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${theme.btnGradient} text-white shadow-lg ${theme.btnShadow} transition-all duration-200 active:scale-[0.97] hover:shadow-xl`}
                          >
                            <FiEdit2 className="text-sm" /> Chỉnh sửa
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.97]"
                            >
                              <FiX className="text-sm" /> Hủy
                            </button>
                            <button
                              onClick={handleSaveProfile}
                              disabled={saving}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${theme.btnGradient} text-white shadow-lg ${theme.btnShadow} transition-all duration-200 active:scale-[0.97] hover:shadow-xl disabled:opacity-50`}
                            >
                              <FiSave className="text-sm" /> {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Fields */}
                      <div className="p-6 space-y-5">
                        {/* Username (read-only) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Tên đăng nhập</label>
                          <div className="px-4 py-3 bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {profile?.username || user?.username || '—'}
                          </div>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Họ và tên</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                              className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:ring-2 ${theme.focusRing}`}
                              placeholder="Nhập họ và tên"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium">
                              {profile?.fullName || '—'}
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:ring-2 ${theme.focusRing}`}
                              placeholder="Nhập số điện thoại"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium">
                              {profile?.phone || '—'}
                            </div>
                          )}
                        </div>

                        {/* Role (read-only) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Vai trò</label>
                          <div className="px-4 py-3 bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {theme.panelLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== CHANGE PASSWORD TAB ===== */}
              {activeTab === 'password' && (
                <div className="animate-fade-in">
                  {/* Message */}
                  {passwordMsg.text && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium
 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 dark:bg-red-900/20 text-red-700 border border-red-200 dark:border-red-800'}`}>
                      {passwordMsg.type === 'success' ? <FiCheck className="text-lg shrink-0" /> : <FiAlertCircle className="text-lg shrink-0" />}
                      {passwordMsg.text}
                    </div>
                  )}

                  <div className="max-w-lg mx-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Thay đổi mật khẩu</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số</p>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* Current Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Mật khẩu hiện tại
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => { setPasswordForm({ ...passwordForm, currentPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, currentPassword: '' }); }}
                              className={`w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:ring-2 ${theme.focusRing}
 ${passwordErrors.currentPassword ? 'border-red-300' : 'border-slate-200 dark:border-slate-700 '}`}
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{passwordErrors.currentPassword}</p>
                          )}
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Mật khẩu mới
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => { setPasswordForm({ ...passwordForm, newPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, newPassword: '' }); }}
                              className={`w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:ring-2 ${theme.focusRing}
 ${passwordErrors.newPassword ? 'border-red-300' : 'border-slate-200 dark:border-slate-700 '}`}
                              placeholder="Nhập mật khẩu mới"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{passwordErrors.newPassword}</p>
                          )}

                          {/* Password Strength Indicator */}
                          {passwordForm.newPassword && (
                            <div className="mt-3">
                              <div className="flex gap-1.5 mb-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300
 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <p className={`text-xs font-bold
 ${passwordStrength.level <= 1 ? 'text-red-500' : passwordStrength.level <= 2 ? 'text-amber-500' : passwordStrength.level <= 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                                Độ mạnh: {passwordStrength.label}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Xác nhận mật khẩu mới
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => { setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }); setPasswordErrors({ ...passwordErrors, confirmPassword: '' }); }}
                              className={`w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none transition-all focus:ring-2 ${theme.focusRing}
 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-slate-200 dark:border-slate-700 '}`}
                              placeholder="Nhập lại mật khẩu mới"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1.5 font-medium">{passwordErrors.confirmPassword}</p>
                          )}
                          {/* Match indicator */}
                          {passwordForm.confirmPassword && !passwordErrors.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                            <p className="text-xs text-emerald-500 mt-1.5 font-medium flex items-center gap-1">
                              <FiCheck className="text-sm" /> Mật khẩu khớp
                            </p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleChangePassword}
                          disabled={saving}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r ${theme.btnGradient} text-white shadow-lg ${theme.btnShadow} transition-all duration-200 active:scale-[0.98] hover:shadow-xl disabled:opacity-50 mt-2`}
                        >
                          <FiLock className="text-sm" />
                          {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
