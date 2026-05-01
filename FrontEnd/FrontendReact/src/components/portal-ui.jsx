import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const publicNav = [
  { label: 'Trang Chủ', to: '/' },
  { label: 'Đội Bóng', to: '/teams' },
  { label: 'Sân Bóng', to: '/stadiums' },
  { label: 'Trận Đấu', to: '/matches' },
  { label: 'Tuyển Quân', to: '/recruitment' },
  { label: 'Vận Hành', to: '/operations' },
];

const adminNav = [
  { id: 'overview', label: 'Tổng Quan', to: '/admin-dashboard' },
  { id: 'users', label: 'Quản Lý Người Dùng', to: '/admin-dashboard?tab=users' },
  { id: 'teams', label: 'Quản Lý Đội Bóng', to: '/admin-dashboard?tab=teams' },
  { id: 'stadiums', label: 'Quản Lý Sân Bóng', to: '/admin-dashboard?tab=stadiums' },
  { id: 'matches', label: 'Quản Lý Trận Đấu', to: '/admin-dashboard?tab=matches' },
];
import { FiMenu, FiX, FiLogOut, FiHome } from 'react-icons/fi';
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
    return 'teal';
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
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  navy: 'bg-slate-100 text-slate-800 border-slate-200',
  slate: 'bg-gray-100 text-gray-800 border-gray-200',
  sand: 'bg-orange-50 text-orange-800 border-orange-200'
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
    <section className={cn('bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-900/5 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 relative overflow-hidden group', className)}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {(title || subtitle || aside) && (
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            {title ? <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">{title}</h3> : null}
            {subtitle ? <p className="text-sm font-medium text-slate-500">{subtitle}</p> : null}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      <div className="text-slate-600 prose prose-slate prose-sm max-w-none">
        {children}
      </div>
    </section>
  );
}

export function PageSection({ eyebrow, title, subtitle, actions, children }) {
  return (
    <section className="mb-16">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div className="max-w-3xl">
          {eyebrow ? <span className="inline-block text-xs font-bold tracking-widest text-teal-600 uppercase mb-2 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">{eyebrow}</span> : null}
          {title ? <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">{title}</h2> : null}
          {subtitle ? <p className="text-lg text-slate-500 font-medium">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3 shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricGrid({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {items.map((item) => (
        <article className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/40 relative overflow-hidden group" key={item.label}>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full blur-2xl group-hover:bg-cyan-100 transition-colors duration-500"></div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 relative z-10">{item.label}</span>
          <strong className="block text-4xl font-black text-slate-900 mb-2 relative z-10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700">{item.value}</strong>
          <p className="text-sm font-medium text-teal-600 relative z-10">{item.note}</p>
        </article>
      ))}
    </div>
  );
}

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm mb-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
                FF
              </div>
              <div>
                <span className="block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-cyan-700 tracking-tight leading-none">FindFootball</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hệ Sinh Thái Bóng Đá</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {publicNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'text-sm font-bold transition-colors',
                  isActive ? 'text-teal-600 border-b-2 border-teal-500 pb-1' : 'text-slate-500 hover:text-teal-500'
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Badge tone="sand">{user?.role || 'Guest'}</Badge>
                <button onClick={logout} className="px-5 py-2 rounded-full font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2">
                  <FiLogOut /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="px-5 py-2 rounded-full font-bold text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 hover:shadow-md transition-all" to="/login">
                  Đăng nhập
                </Link>
                <Link className="px-5 py-2 rounded-full font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all" to="/register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4">
          {publicNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                'block px-4 py-3 rounded-xl text-base font-bold',
                isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <Link onClick={() => setIsOpen(false)} className="block w-full text-center px-5 py-3 rounded-xl font-bold text-teal-700 bg-teal-50 border border-teal-100" to="/login">
              Đăng nhập
            </Link>
            <Link onClick={() => setIsOpen(false)} className="block w-full text-center px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500" to="/register">
              Đăng ký
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicLayout({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500 selection:text-white pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[120px]"></div>
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-200/20 blur-[120px]"></div>
      </div>
      
      <PublicHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 rounded-[2.5rem] p-8 md:p-12 lg:p-16 mb-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-500/30 rounded-full blur-[80px]"></div>
             <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-500/30 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-sm font-bold tracking-widest uppercase mb-6">
              Nền tảng cộng đồng bóng đá
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-teal-50/80 font-medium mb-10 leading-relaxed max-w-2xl">
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
    <aside className="w-full lg:w-72 shrink-0 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed lg:sticky top-0 z-40">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          CR
        </div>
        <div>
          <strong className="block text-lg font-black text-slate-900 tracking-tight">Control Room</strong>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">FindFootball Admin</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
            {initials(user?.username || 'Guest')}
          </div>
          <div>
            <strong className="block text-slate-900 font-bold">{user?.username || 'Guest User'}</strong>
            <span className="block text-xs font-bold text-teal-600 uppercase mt-0.5">{user?.role || 'Guest'}</span>
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
              isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <Link className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors" to="/">
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500 selection:text-white flex flex-col lg:flex-row">
      <AdminSidebar user={user} />
      <main className="flex-1 p-6 lg:p-10 w-full overflow-x-hidden ml-0 lg:ml-0">
        <header className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
          <div>
            <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Bảng điều hành</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{title}</h1>
            <p className="text-slate-500 font-medium">{subtitle}</p>
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
      <span className="block text-sm font-bold text-slate-700 mb-1">{label}</span>
      {hint ? <span className="block text-xs font-medium text-slate-500 mb-2">{hint}</span> : null}
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
  const baseClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium";
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
            <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-slate-100">
              <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" type="button">
                {primaryLabel}
              </button>
              <Link className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all" to={secondaryTo}>
                {secondaryLabel}
              </Link>
            </div>
          </SurfaceCard>
        </div>
        <div className="xl:col-span-1 space-y-6">
          <SurfaceCard className="bg-teal-50 border-teal-100" title={asideTitle} subtitle="Hướng dẫn thao tác">
            <ul className="space-y-3 mt-4">
              {asideItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <span className="text-sm font-medium text-teal-900">{item}</span>
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500 selection:text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/30 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-[120px]"></div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-900/5 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Left Side */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 p-10 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-16 hover:text-teal-300 transition-colors">
              <FiHome /> Về trang chủ
            </Link>
            <span className="inline-block text-xs font-bold tracking-widest text-teal-300 uppercase mb-3 bg-white/10 px-3 py-1 rounded-full border border-white/20">FindFootball Access</span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">{title}</h1>
            <p className="text-teal-50/80 text-lg font-medium mb-12">{subtitle}</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold text-xl mb-4">{asideTitle}</h3>
              <ul className="space-y-3">
                {asideItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">✓</div>
                     <span className="text-sm font-medium text-teal-50">{item}</span>
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
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
      <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8">{description}</p>
      {action}
    </div>
  );
}
