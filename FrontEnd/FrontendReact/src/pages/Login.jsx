import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Alert } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FiMail, FiUser, FiLock, FiUserCheck, FiArrowRight, FiSun, FiMoon, FiArrowLeft } from 'react-icons/fi';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorState, setTwoFactorState] = useState(null); // 'verify' or 'setup'
  const [pin, setPin] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');

  const { login, verify2FA, setup2FA } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clean up state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (twoFactorState) {
        response = await verify2FA(formData.username, formData.password, pin);
      } else {
        response = await login(formData.username, formData.password);
        if (response.requires2FA) {
          setTwoFactorState('verify');
          setSuccessMsg('Vui lòng nhập mã Google Authenticator (6 chữ số).');
          return;
        }
        if (response.requiresSetup2FA) {
          const setupRes = await setup2FA(formData.username, formData.password);
          setQrCode(setupRes.qrCodeImageUrl);
          setManualKey(setupRes.manualEntryKey);
          setTwoFactorState('setup');
          setSuccessMsg('Cài đặt Google Authenticator bằng cách quét mã QR.');
          return;
        }
      }
      
      if (response.role === 'Admin') {
        navigate('/admin-home');
      } else if (response.role === 'Captain') {
        navigate('/captain-home');
      } else if (response.role === 'StadiumOwner') {
        navigate('/owner-home');
      } else if (response.role === 'Player') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errMsg = err?.message || (typeof err === 'string' ? err : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-950 font-sans flex page-enter">
      {/* Left — Hero Image with WC2026 overlay */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <img
          src="/login-hero.png"
          alt="Football match"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wc-navy-950/95 via-wc-navy-900/60 to-wc-red-900/30" />
        {/* Gold particle accents */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-wc-gold-500/20 rounded-full blur-[60px] animate-stadium-pulse"></div>
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-wc-gold-500/15 rounded-full blur-[40px] animate-stadium-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
          <Link to="/" className="flex items-center gap-1 mb-8 group">
            <span className="text-3xl font-bold text-white tracking-tighter">Sportify</span>
            <span className="text-3xl font-bold text-wc-gold-400 transform -skew-x-12 relative -ml-0.5">X</span>
          </Link>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Kết Nối Đam Mê.<br />Chinh Phục Sân Cỏ.
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            Nền tảng quản lý đội bóng, tìm đối thủ và đặt sân hàng đầu Việt Nam 🏆
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 xl:p-12 relative">




        <div className="w-full max-w-md animate-fade-in-up">
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

          <div className="mb-4 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-wc-gold-50 dark:bg-wc-gold-500/10 text-wc-gold-600 dark:text-wc-gold-400 mb-6">
              <FiUserCheck className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Chào Mừng Trở Lại</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Đăng nhập để quản lý và tổ chức trận đấu ⚽</p>
          </div>

          {successMsg && (
            <Alert
              type="success"
              title="Thành Công"
              message={successMsg}
              onClose={() => setSuccessMsg('')}
              className="mb-6 rounded-xl"
            />
          )}

          {error && (
            <Alert
              type="error"
              title="Lỗi Đăng Nhập"
              message={error}
              onClose={() => setError('')}
              className="mb-6 rounded-xl"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!twoFactorState ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tên đăng nhập</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nhập tên đăng nhập"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-wc-navy-800/80 border border-slate-200 dark:border-wc-navy-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/30 focus:border-wc-gold-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-wc-navy-800/80 border border-slate-200 dark:border-wc-navy-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/30 focus:border-wc-gold-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {twoFactorState === 'setup' && (
                  <div className="bg-slate-100 dark:bg-wc-navy-800 p-4 rounded-xl text-center">
                    <img src={qrCode} alt="QR Code" className="mx-auto mb-2 rounded shadow-sm bg-white p-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-wc-navy-900 p-2 rounded">{manualKey}</p>
                    <p className="text-xs text-slate-500 mt-2">Quét mã QR này hoặc nhập key thủ công vào ứng dụng Google Authenticator.</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mã xác thực (6 chữ số)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXXXX"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-wc-navy-800/80 border border-slate-200 dark:border-wc-navy-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-wc-gold-500/30 focus:border-wc-gold-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 tracking-widest text-center text-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}



            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 sm:py-3.5 sm:px-4 bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 rounded-xl font-bold shadow-lg shadow-wc-gold-500/20 hover:shadow-xl hover:shadow-wc-gold-500/30 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {twoFactorState ? 'Xác Thực 2FA' : 'Đăng Nhập'}
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-wc-navy-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-wc-gold-600 dark:text-wc-gold-400 font-bold hover:underline transition-colors">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
