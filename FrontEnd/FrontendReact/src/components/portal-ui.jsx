import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const publicNav = [
  { label: 'Trang Chủ', tab: 'home' },
  { label: 'Đội Thể Thao', tab: 'teams' },
  { label: 'Sân Thể Thao', tab: 'stadiums' },
  { label: 'Trận Đấu', tab: 'matches' },
  { label: 'Giải Đấu', tab: 'tournaments' },
  { label: 'Tuyển Quân', tab: 'recruitments' },
  { label: 'Bảng Xếp Hạng', tab: 'rankings' },
  { label: 'Cộng Đồng', tab: 'feed' },
];

const adminNav = [
  { id: 'overview', label: 'Tổng Quan', to: '/admin-home' },
  { id: 'users', label: 'Quản Lý Người Dùng', to: '/admin-home?tab=users' },
  { id: 'teams', label: 'Quản Lý Đội Thể Thao', to: '/admin-home?tab=teams' },
  { id: 'stadiums', label: 'Quản Lý Sân Thể Thao', to: '/admin-home?tab=stadiums' },
  { id: 'matches', label: 'Quản Lý Trận Đấu', to: '/admin-home?tab=matches' },
];
import { FiMenu, FiX, FiLogOut, FiHome, FiUser, FiAward, FiSun, FiMoon, FiDollarSign, FiHeart, FiSettings } from 'react-icons/fi';
import { useState } from 'react';

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

export function initials(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function toneFromStatus(value = '') {
  const normalized = value.toLowerCase();

  if (
    normalized.includes('accepted') ||
    normalized.includes('đã xác nhận') ||
    normalized.includes('completed') ||
    normalized.includes('approved') ||
    normalized.includes('đã duyệt')
  ) {
    return 'gold';
  }

  if (
    normalized.includes('proposed') ||
    normalized.includes('pending') ||
    normalized.includes('chờ') ||
    normalized.includes('giữ slot')
  ) {
    return 'amber';
  }

  if (normalized.includes('cancel') || normalized.includes('error')) {
    return 'rose';
  }

  return 'navy';
}

const TONE_CLASSES = {
  gold: 'bg-wc-gold-100 dark:bg-wc-gold-500/20 text-wc-gold-800 dark:text-wc-gold-300 border-wc-gold-200 dark:border-wc-gold-500/30',
  teal: 'bg-slate-200 dark:bg-slate-700 text-teal-800 dark:text-teal-300 border-slate-300 dark:border-slate-600',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  navy: 'bg-wc-navy-100 dark:bg-wc-navy-800 text-wc-navy-800 dark:text-slate-200 border-wc-navy-200 dark:border-wc-navy-700',
  slate: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-600',
  sand: 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
};

export function Badge({ tone = 'slate', children }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border', TONE_CLASSES[tone] || TONE_CLASSES.slate)}>
      {children}
    </span>
  );
}

export function SurfaceCard({ title, subtitle, aside, className, children }) {
  return (
    <section className={cn('bg-white dark:bg-wc-navy-900/80 backdrop-blur-xl border border-slate-200 dark:border-wc-navy-800/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-wc-navy-950/5 hover:shadow-2xl hover:shadow-wc-gold-500/5 transition-all duration-300 relative overflow-hidden group', className)}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wc-gold-400 to-wc-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {(title || subtitle || aside) && (
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            {title ? <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">{title}</h3> : null}
            {subtitle ? <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      <div className="text-slate-600 dark:text-slate-300 prose prose-slate prose-sm max-w-none">
        {children}
      </div>
    </section>
  );
}

export function PageSection({ eyebrow, title, subtitle, actions, children }) {
  return (
    <section className="mb-8 sm:mb-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="max-w-3xl">
          {eyebrow ? <span className="inline-block text-xs font-bold tracking-widest text-wc-gold-700 dark:text-wc-gold-400 uppercase mb-2 bg-wc-gold-50 dark:bg-wc-gold-500/10 px-3 py-1 rounded-full border border-wc-gold-200 dark:border-wc-gold-500/20">{eyebrow}</span> : null}
          {title ? <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">{title}</h2> : null}
          {subtitle ? <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-16">
      {items.map((item) => (
        <article className="bg-white dark:bg-wc-navy-900/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-wc-navy-800/50 shadow-lg shadow-slate-200/40 dark:shadow-wc-navy-950/20 relative overflow-hidden group" key={item.label}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-100 dark:bg-wc-navy-800 rounded-full blur-2xl group-hover:bg-wc-gold-100 dark:group-hover:bg-wc-gold-500/10 transition-colors duration-500"></div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 relative z-10">{item.label}</span>
          <strong className="block text-4xl font-black mb-2 relative z-10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700 dark:from-wc-gold-300 dark:to-wc-gold-500">{item.value}</strong>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 relative z-10">{item.note}</p>
        </article>
      ))}
    </div>
  );
}

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hideOnboarding, setHideOnboarding] = useState(localStorage.getItem('hideOnboarding') === 'true');

  const toggleOnboarding = () => {
    const newVal = !hideOnboarding;
    setHideOnboarding(newVal);
    localStorage.setItem('hideOnboarding', newVal.toString());
  };
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavPath = (tab) => {
    if (tab === 'home') return '/';
    if (tab === 'teams') return '/teams';
    if (tab === 'stadiums') return '/stadiums';
    if (tab === 'matches') return '/matches';
    if (tab === 'tournaments') return '/tournaments';
    if (tab === 'recruitments') return '/recruitments';
    if (tab === 'rankings') return '/rankings';
    if (tab === 'feed') return '/feed';
    return '/';
  };

  const isTabActive = (tab) => {
    if (tab === 'home' && location.pathname === '/') return true;
    if (location.pathname === `/${tab}`) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-wc-navy-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-wc-navy-800/80 z-50 transition-colors duration-300">
        <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center group">
              <div className="h-20 w-auto flex items-center justify-center">
                <img src="/favicon.png" alt="SportifyX Logo" className="h-full w-auto object-contain" />
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {publicNav.map((item) => (
              <Link
                key={item.tab}
                to={getNavPath(item.tab)}
                className={cn(
                  'text-sm font-semibold transition-colors py-2 border-b-2',
                  isTabActive(item.tab) ? 'text-wc-gold-600 dark:text-wc-gold-400 border-wc-gold-500' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-wc-gold-500/40'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">

            {isAuthenticated ? (
              <>
                <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 bg-white dark:bg-wc-navy-800 rounded-full pl-2 pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-wc-navy-700 hover:shadow-md hover:border-wc-gold-500/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 flex items-center justify-center font-bold text-xs shadow-sm">
                    {initials(user?.username || 'U')}
                  </div>
                  <div className="text-left flex flex-col">
                    <span className="text-slate-800 dark:text-slate-100 font-bold text-sm leading-tight flex items-center gap-1">
                      {user?.username || 'User'}
                      {user?.isPremium && <FiAward className="text-wc-gold-500" title="Premium User" />}
                    </span>
                    <span className="text-wc-gold-600 dark:text-wc-gold-400 text-[10px] font-bold uppercase">{user?.role || 'Guest'}</span>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-wc-navy-800 rounded-xl shadow-lg border border-slate-200 dark:border-wc-navy-700 py-2 z-50">
                    <Link onClick={() => setShowUserMenu(false)} to={
                      '/profile'
                    } className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <FiUser className="text-slate-400" /> Hồ sơ cá nhân
                    </Link>
                    <Link onClick={() => setShowUserMenu(false)} to={
                      user?.role === 'Admin' ? '/admin-home' :
                      user?.role === 'Captain' ? '/captain-home' :
                      user?.role === 'StadiumOwner' ? '/owner-home' :
                      user?.role === 'Player' ? '/player-home' : '/'
                    } className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <FiHome className="text-slate-400" /> Bảng điều khiển
                    </Link>
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <div className="flex items-center gap-2">
                        {isDark ? <FiSun className="text-slate-400" /> : <FiMoon className="text-slate-400" />} Giao diện
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-wc-navy-900 px-1.5 py-0.5 rounded text-slate-500">{isDark ? 'Tối' : 'Sáng'}</span>
                    </button>
                    <button onClick={toggleOnboarding} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <div className="flex items-center gap-2">
                        <FiSettings className="text-slate-400" /> Hướng dẫn
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-wc-navy-900 px-1.5 py-0.5 rounded text-slate-500">{hideOnboarding ? 'Tắt' : 'Bật'}</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <FiLogOut className="text-red-400" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={toggleTheme} 
                    className="p-2.5 rounded-xl bg-white dark:bg-wc-navy-800 border border-slate-200 dark:border-wc-navy-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-wc-navy-700 transition-all shadow-sm"
                    title={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
                  >
                    {isDark ? <FiSun className="w-5 h-5 text-wc-gold-400" /> : <FiMoon className="w-5 h-5 text-slate-600" />}
                  </button>
                  <Link className="px-5 py-2 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-wc-navy-800 border border-slate-200 dark:border-wc-navy-700 hover:bg-slate-50 dark:hover:bg-wc-navy-700 transition-all" to="/login">
                    Đăng nhập
                  </Link>
                </div>
                <Link className="px-5 py-2 rounded-xl font-semibold text-wc-navy-950 bg-gradient-to-r from-wc-gold-400 to-wc-gold-500 hover:from-wc-gold-300 hover:to-wc-gold-400 shadow-sm shadow-wc-gold-500/20 transition-all" to="/register">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 p-2">
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-wc-navy-900 border-b border-slate-200 dark:border-wc-navy-800 px-4 py-6 space-y-4">
          {publicNav.map((item) => (
            <Link
              key={item.tab}
              to={getNavPath(item.tab)}
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-xl text-base font-bold',
                isTabActive(item.tab) ? 'bg-wc-gold-50 dark:bg-wc-gold-500/10 text-wc-gold-700 dark:text-wc-gold-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-800'
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 dark:border-wc-navy-800/50 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-wc-navy-800/50 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 flex items-center justify-center font-bold text-sm shadow-sm">
                    {initials(user?.username || 'U')}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 dark:text-white font-bold text-sm">
                      {user?.username || 'User'}
                    </span>
                    <span className="text-wc-gold-600 dark:text-wc-gold-400 text-xs font-bold uppercase">{user?.role || 'Guest'}</span>
                  </div>
                </div>
                <Link
                  onClick={() => setIsOpen(false)}
                  to={
                    user?.role === 'Admin' ? '/admin-home' :
                    user?.role === 'Captain' ? '/captain-home' :
                    user?.role === 'StadiumOwner' ? '/owner-home' :
                    user?.role === 'Player' ? '/player-home' : '/'
                  }
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-wc-navy-800 hover:bg-slate-200 dark:hover:bg-wc-navy-700 transition-colors mb-3"
                >
                  <FiHome className="text-slate-500 dark:text-slate-400" /> Bảng điều khiển
                </Link>
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                  <FiLogOut className="text-rose-400" /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setIsOpen(false)} className="block w-full text-center px-5 py-3 rounded-xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-wc-navy-800 border border-slate-200 dark:border-wc-navy-700" to="/login">
                  Đăng nhập
                </Link>
                <Link onClick={() => setIsOpen(false)} className="block w-full text-center px-5 py-3 rounded-xl font-bold text-wc-navy-950 bg-gradient-to-r from-wc-gold-400 to-wc-gold-500" to="/register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    <div className="h-20 shrink-0"></div>
    </>
  );
}

export function PublicLayout({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-wc-gold-500 dark:bg-wc-navy-950 selection:text-wc-navy-950 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-wc-gold-200/15 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-wc-red-200/15 blur-[120px]"></div>
      </div>

      <PublicHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <section className="bg-gradient-to-br from-wc-navy-950 via-wc-navy-900 to-wc-red-900/60 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 lg:p-16 mb-12 sm:mb-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute -right-20 -top-20 w-96 h-96 bg-wc-gold-500/15 rounded-full blur-[80px]"></div>
             <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-wc-teal-500/20 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-wc-gold-500/30 text-wc-gold-300 text-sm font-bold tracking-widest uppercase mb-6">
              ⚽ SportifyX Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium mb-10 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
            {actions ? <div className="flex flex-wrap gap-4">{actions}</div> : null}
          </div>
        </section>
        
        {children}
      </main>
    </div>
  );
}

function AdminSidebar({ user }) {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-wc-navy-900 border-r border-slate-200 dark:border-wc-navy-800 min-h-screen flex flex-col fixed lg:sticky top-0 z-40">
      <div className="p-6 border-b border-slate-100 dark:border-wc-navy-800/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wc-navy-800 to-wc-navy-950 flex items-center justify-center text-wc-gold-400 font-bold text-xl shadow-lg">
          CR
        </div>
        <div>
          <strong className="block text-lg font-black text-slate-900 dark:text-white tracking-tight">Control Room</strong>
          <span className="block text-[10px] font-bold text-wc-gold-600 dark:text-wc-gold-400 uppercase tracking-widest">Admin Portal</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-wc-navy-800/50 border border-slate-100 dark:border-wc-navy-700/50 rounded-2xl p-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 flex items-center justify-center font-bold text-lg shadow-md">
            {initials(user?.username || 'Guest')}
          </div>
          <div>
            <strong className="block text-slate-900 dark:text-white font-bold">{user?.username || 'Guest User'}</strong>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">{user?.role || 'Guest'}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 px-4 mt-2">Menu Quản Trị</div>
        {adminNav.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all',
              isActive ? 'bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 shadow-md shadow-wc-gold-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-wc-navy-800'
            )}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-wc-navy-800/50">
        <Link className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 dark:bg-wc-navy-800 hover:bg-slate-200 dark:hover:bg-wc-navy-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors" to="/">
          <FiHome /> Về trang khách
        </Link>
      </div>
    </aside>
  );
}

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-950 font-sans selection:bg-wc-gold-500 selection:text-wc-navy-950 flex flex-col lg:flex-row">
      <AdminSidebar user={user} />
      <main className="flex-1 p-6 lg:p-10 w-full overflow-x-hidden ml-0 lg:ml-0">
        <header className="bg-white dark:bg-wc-navy-900/80 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-wc-navy-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-wc-gold-100/50 dark:bg-wc-gold-500/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
          <div>
            <span className="inline-block text-xs font-bold tracking-widest text-wc-gold-600 dark:text-wc-gold-400 uppercase mb-2">🏆 Bảng điều hành</span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
        </header>
        <div className="space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LabeledField({ label, hint, span = 'half', children }) {
  return (
    <label className={cn('block', span === 'full' && 'col-span-1 md:col-span-2')}>
      <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</span>
      {hint ? <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{hint}</span> : null}
      <div className="mt-1">
        {children}
      </div>
    </label>
  );
}

export function DemoInput({
  label,
  hint,
  type = 'text',
  placeholder,
  defaultValue,
  as = 'input',
  options = [],
  rows = 4,
  span,
}) {
  const baseClasses = "w-full px-4 py-3 bg-slate-50 dark:bg-wc-navy-800/80 border border-slate-200 dark:border-wc-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wc-gold-500/20 focus:border-wc-gold-500 transition-all font-medium";
  return (
    <LabeledField label={label} hint={hint} span={span}>
      {as === 'textarea' ? (
        <textarea className={baseClasses} defaultValue={defaultValue} placeholder={placeholder} rows={rows} />
      ) : as === 'select' ? (
        <select className={baseClasses} defaultValue={defaultValue}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input className={baseClasses} type={type} defaultValue={defaultValue} placeholder={placeholder} />
      )}
    </LabeledField>
  );
}

export function CrudPage({
  title,
  subtitle,
  fields,
  asideTitle,
  asideItems,
  primaryLabel = 'Lưu nháp',
  secondaryLabel = 'Hủy',
  secondaryTo = '/admin-dashboard',
}) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <SurfaceCard
            title="Thông tin chi tiết"
            subtitle="Điền các trường thông tin bên dưới."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {fields.map((field) => (
                <DemoInput key={field.label} {...field} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-slate-100 dark:border-wc-navy-800/50">
              <button className="px-6 py-3 bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 rounded-xl font-bold transition-all shadow-lg shadow-wc-gold-500/20 hover:shadow-xl hover:-translate-y-0.5" type="button">
                {primaryLabel}
              </button>
              <Link className="px-6 py-3 bg-white dark:bg-wc-navy-900 border border-slate-200 dark:border-wc-navy-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all" to={secondaryTo}>
                {secondaryLabel}
              </Link>
            </div>
          </SurfaceCard>
        </div>
        <div className="xl:col-span-1 space-y-6">
          <SurfaceCard className="bg-wc-gold-50 dark:bg-wc-navy-800 border-wc-gold-200 dark:border-wc-navy-700" title={asideTitle} subtitle="Hướng dẫn thao tác">
            <ul className="space-y-3 mt-4">
              {asideItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-wc-gold-400 text-wc-navy-950 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <span className="text-sm font-medium text-wc-navy-900 dark:text-wc-gold-100">{item}</span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </div>
    </AdminLayout>
  );
}

export function AuthLayout({ title, subtitle, asideTitle, asideItems, children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-950 font-sans selection:bg-wc-gold-500 selection:text-wc-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-wc-gold-200/20 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-wc-red-200/20 blur-[120px]"></div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 bg-white dark:bg-wc-navy-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-wc-navy-950/10 border border-slate-100 dark:border-wc-navy-800/50 overflow-hidden relative z-10">
        
        {/* Left Side */}
        <div className="lg:col-span-2 bg-gradient-to-br from-wc-navy-950 via-wc-navy-900 to-wc-red-900/60 p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-wc-gold-500/15 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-16 hover:text-wc-gold-300 transition-colors">
              <FiHome /> Về trang chủ
            </Link>
            <span className="inline-block text-xs font-bold tracking-widest text-wc-gold-300 uppercase mb-3 bg-white/10 px-3 py-1 rounded-full border border-wc-gold-500/30">⚽ Platform Access</span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">{title}</h1>
            <p className="text-white/70 text-lg font-medium mb-12">{subtitle}</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-wc-gold-500/20">
              <h3 className="font-bold text-xl mb-4">{asideTitle}</h3>
              <ul className="space-y-3">
                {asideItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-wc-gold-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-wc-navy-950">✓</div>
                     <span className="text-sm font-medium text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right Side */}
        <div className="lg:col-span-3 p-10 lg:p-16 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full">
             {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-wc-navy-900/50 border-2 border-dashed border-slate-200 dark:border-wc-navy-700 rounded-3xl">
      <div className="w-20 h-20 bg-white dark:bg-wc-navy-900 rounded-full shadow-sm flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-slate-300 dark:text-wc-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">{description}</p>
      {action}
    </div>
  );
}

export function DashboardSidebar({ brandLabel = 'SportifyX', subLabel, navItems, activeTab, setActiveTab, onLogout, userRole }) {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Close sidebar on navigation
  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-wc-navy-800">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-16 w-auto flex items-start">
              <img src="/favicon.png" alt="SportifyX Logo" className="h-full w-auto object-contain" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-wc-gold-600 dark:text-wc-gold-400 uppercase tracking-widest mt-1">{subLabel}</span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng menu"
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-wc-navy-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 px-3 py-4">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-3">Menu Quản Lý</div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-colors tour-step-${item.id} ${
                  active
                    ? 'bg-wc-gold-50 dark:bg-wc-gold-500/10 text-wc-gold-700 dark:text-wc-gold-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-wc-navy-800'
                }`}
              >
                <Icon className={`text-lg ${active ? 'text-wc-gold-600 dark:text-wc-gold-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 mt-auto border-t border-slate-100 dark:border-wc-navy-800 space-y-1">
        <div 
          onClick={() => setShowDonateModal(true)}
          className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-wc-gold-500/25 transition-all"
        >
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-1"><FiHeart className="text-wc-red-500" /> Ủng hộ nền tảng</h4>
            <p className="text-[10px] text-wc-navy-800 leading-tight">Donate để giúp SportifyX duy trì server & phát triển thêm tính năng.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all"></div>
        </div>

        {/* Theme toggle - visible on mobile */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-wc-navy-800 rounded-xl font-medium text-sm transition-colors"
        >
          {isDark ? <FiSun className="text-lg text-wc-gold-400" /> : <FiMoon className="text-lg text-slate-400 dark:text-slate-500" />}
          {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        </button>

        <button
          onClick={() => {
            if(setActiveTab) setActiveTab('profile');
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-wc-navy-800 rounded-xl font-medium text-sm transition-colors text-left"
        >
          <FiUser className="text-lg text-slate-400 dark:text-slate-500" /> Hồ sơ cá nhân
        </button>
        <Link to="/" className="flex items-center gap-3 px-3 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-wc-navy-800 rounded-xl font-medium text-sm transition-colors">
          <FiHome className="text-lg text-slate-400 dark:text-slate-500" /> Về trang chủ
        </Link>
        <button onClick={() => { onLogout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-medium text-sm transition-colors">
          <FiLogOut className="text-lg text-red-400" /> Đăng xuất
        </button>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-wc-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-wc-navy-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-wc-navy-700 hover:bg-slate-200 dark:hover:bg-wc-navy-600 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center transition-colors"
            >
              <FiX className="text-lg" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-wc-gold-600 dark:text-wc-gold-400">Ủng hộ chúng tôi</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Quét mã QR dưới đây để gửi cho mình 1 cốc cafe nhé! Cảm ơn bạn rất nhiều! ❤️</p>
            </div>
            <div className="bg-slate-50 dark:bg-wc-navy-700/50 rounded-2xl p-4 border border-slate-200 dark:border-wc-navy-600 mb-6 flex justify-center">
              <img src="/QR.jpg" alt="Mã QR Donate" className="w-64 h-64 object-contain rounded-xl shadow-sm" />
            </div>
            <button
              onClick={() => setShowDonateModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 font-bold transition-all hover:shadow-lg hover:shadow-wc-gold-500/30"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger button - fixed position */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-wc-navy-800 rounded-xl shadow-lg border border-slate-200 dark:border-wc-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-wc-navy-700 transition-all"
        aria-label="Mở menu"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-white dark:bg-wc-navy-900 border-r border-slate-200 dark:border-wc-navy-800 min-h-screen flex-col sticky top-0 h-screen overflow-y-auto z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar - slide-in overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-wc-navy-950/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar drawer */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white dark:bg-wc-navy-900 shadow-2xl flex flex-col overflow-y-auto"
            style={{ animation: 'slideInLeft 0.25s ease-out forwards' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function DashboardLayout({ sidebar, topBar, children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-wc-navy-950 flex">
      {sidebar}
      <main className="flex-1 p-3 pt-20 sm:p-4 sm:pt-16 lg:pt-6 lg:p-8 overflow-x-hidden page-enter">
        {topBar}
        {children}
      </main>
    </div>
  );
}
