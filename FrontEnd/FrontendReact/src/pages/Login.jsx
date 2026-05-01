import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiUserCheck, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userRole: 'Player',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      await login(formData.username, formData.password, formData.userRole);
      
      // Redirect based on role
      if (formData.userRole === 'Admin') {
        navigate('/admin-dashboard');
      } else if (formData.userRole === 'Captain') {
        navigate('/captain-dashboard');
      } else if (formData.userRole === 'StadiumOwner') {
        navigate('/stadium-owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500 selection:text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/30 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-[120px]"></div>
      </div>

      <Link to="/" className="absolute top-6 left-6 text-slate-500 hover:text-teal-600 transition-colors font-medium flex items-center gap-2">
         Về Trang Chủ
      </Link>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-900/5 border border-slate-100 p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30 mb-6">
              <FiUserCheck className="text-3xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chào Mừng Trở Lại</h1>
            <p className="text-slate-500 mt-2 font-medium">Đăng nhập để quản lý đội bóng của bạn</p>
          </div>

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
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò <span className="text-rose-500">*</span></label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 font-medium"
              >
                <option value="Player">Cầu thủ</option>
                <option value="Captain">Đội trưởng</option>
                <option value="StadiumOwner">Chủ sân bóng</option>
                <option value="Admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'} <FiArrowRight className={loading ? 'hidden' : 'block'} />
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-teal-600 font-bold hover:text-teal-500 hover:underline transition-colors">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>

            <div className="mt-8 p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
              <h4 className="font-bold text-teal-900 mb-3 text-sm uppercase tracking-wider">Tài Khoản Demo (Từ DbSeeder):</h4>
              <ul className="text-sm font-medium text-teal-800 space-y-2">
                <li className="flex items-center justify-between gap-2">
                  <span><span className="w-5 inline-block text-center">👤</span> Admin</span>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">admin</code>
                    <span className="text-teal-300">/</span>
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">Pass12345</code>
                  </div>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span><span className="w-5 inline-block text-center">🏆</span> Captain</span>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">captain</code>
                    <span className="text-teal-300">/</span>
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">Pass12345</code>
                  </div>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span><span className="w-5 inline-block text-center">🏟️</span> Stadium</span>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">stadiumowner</code>
                    <span className="text-teal-300">/</span>
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">Pass12345</code>
                  </div>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span><span className="w-5 inline-block text-center">⚽</span> Player</span>
                  <div className="flex gap-2">
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">player</code>
                    <span className="text-teal-300">/</span>
                    <code className="bg-white px-2 py-0.5 rounded text-teal-600 shadow-sm border border-teal-100">Pass12345</code>
                  </div>
                </li>
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
