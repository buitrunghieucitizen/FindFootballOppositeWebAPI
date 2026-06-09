import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiUserPlus, FiUser, FiPhone, FiLock, FiArrowRight, FiShield, FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userRole: 'Player',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.fullName || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Số điện thoại phải có 10 chữ số');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register(formData.username, formData.fullName, formData.phone, formData.password, formData.confirmPassword, formData.userRole);
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3 bg-white dark:bg-wc-navy-800/80 border border-slate-200 dark:border-wc-navy-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/30 focus:border-wc-gold-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";
  const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
  const iconCls = "text-slate-400 dark:text-slate-500";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-950 font-sans flex page-enter">
      {/* Left — Hero Image with WC2026 overlay */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <img src="/login-hero.png" alt="Football match" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-wc-navy-950/95 via-wc-navy-900/60 to-wc-red-900/30" />
        {/* Gold particle accents */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-wc-gold-500/20 rounded-full blur-[60px] animate-stadium-pulse"></div>
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-wc-gold-500/15 rounded-full blur-[40px] animate-stadium-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
          <Link to="/" className="flex items-center gap-1 mb-8">
            <span className="text-3xl font-bold text-white tracking-tighter">Sportify</span>
            <span className="text-3xl font-bold text-wc-gold-400 transform -skew-x-12 relative -ml-0.5">X</span>
          </Link>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Bắt Đầu Hành Trình<br />Sân Cỏ Của Bạn.
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            Đăng ký miễn phí và tham gia cộng đồng bóng đá lớn nhất Việt Nam 🏆
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-y-auto">


        <Link to="/" className="hidden">
        </Link>

        <div className="w-full max-w-md animate-fade-in-up py-8">
          {/* Top actions */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-wc-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-wc-navy-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm font-semibold text-sm"
            >
              <FiArrowLeft className="text-lg" /> Về Trang Chủ
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-wc-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-wc-navy-700 transition-colors shadow-sm"
              title={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-wc-gold-50 dark:bg-wc-gold-500/10 text-wc-gold-600 dark:text-wc-gold-400 mb-6">
              <FiUserPlus className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tạo Tài Khoản</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Bắt đầu hành trình bóng đá ⚽</p>
          </div>

          {error && (
            <Alert type="error" title="Lỗi Đăng Ký" message={error} onClose={() => setError('')} className="mb-6 rounded-xl" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tên đăng nhập</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiUser className={iconCls} /></div>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="VD: nguyenvan_a" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiUser className={iconCls} /></div>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required className={inputCls} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiPhone className={iconCls} /></div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập 10 chữ số" required className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className={iconCls} /></div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className={iconCls} /></div>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" required className={inputCls} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Vai trò <span className="text-wc-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiShield className={iconCls + " z-10"} /></div>
                <select name="userRole" value={formData.userRole} onChange={handleChange} className={inputCls + " font-medium"}>
                  <option value="Player">Cầu thủ (Tìm đội, tham gia trận)</option>
                  <option value="Captain">Đội trưởng (Tạo đội, cáp kèo)</option>
                  <option value="StadiumOwner">Chủ sân thể thao (Quản lý sân)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 rounded-xl font-bold shadow-lg shadow-wc-gold-500/20 hover:shadow-xl hover:shadow-wc-gold-500/30 transition-all disabled:opacity-70 disabled:pointer-events-none">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Ngay'} <FiArrowRight className={loading ? 'hidden' : 'block'} />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-wc-navy-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-wc-gold-600 dark:text-wc-gold-400 font-bold hover:underline transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
