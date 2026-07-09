import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiTarget, FiMapPin, FiCalendar, FiUsers, FiArrowRight,
  FiShield, FiStar, FiActivity, FiAward, FiTrendingUp,
  FiChevronRight, FiPlay, FiZap
} from 'react-icons/fi';
import { PublicHeader } from '../components/portal-ui';

// SportifyX Theme Components

export default function HomePage() {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  const features = [
    {
      icon: FiUsers,
      title: 'Quản lý đội bóng',
      description: 'Dễ dàng tạo, quản lý và xây dựng đội bóng của bạn với các công cụ chuyên nghiệp.',
      gradient: 'from-wc-gold-500 to-wc-gold-600',
      glow: 'group-hover:shadow-wc-gold-500/25',
      iconBg: 'bg-wc-gold-500/10 dark:bg-wc-gold-500/20 text-wc-gold-600 dark:text-wc-gold-400',
    },
    {
      icon: FiMapPin,
      title: 'Tìm sân bóng',
      description: 'Khám phá và đặt sân bóng chất lượng cao gần khu vực của bạn trong vài giây.',
      gradient: 'from-wc-teal-500 to-wc-teal-600',
      glow: 'group-hover:shadow-wc-teal-500/25',
      iconBg: 'bg-wc-teal-500/10 dark:bg-wc-teal-500/20 text-wc-teal-500 dark:text-wc-teal-400',
    },
    {
      icon: FiCalendar,
      title: 'Lên lịch thi đấu',
      description: 'Sắp xếp lịch thi đấu, gửi lời mời và theo dõi kết quả một cách trực quan.',
      gradient: 'from-wc-red-500 to-wc-red-900',
      glow: 'group-hover:shadow-wc-red-500/25',
      iconBg: 'bg-wc-red-500/10 dark:bg-wc-red-500/20 text-wc-red-500 dark:text-wc-red-400',
    },
    {
      icon: FiTarget,
      title: 'Tuyển quân',
      description: 'Đăng tin tuyển dụng và tìm kiếm những cầu thủ tài năng cho đội hình của bạn.',
      gradient: 'from-wc-green-500 to-wc-green-600',
      glow: 'group-hover:shadow-wc-green-500/25',
      iconBg: 'bg-wc-green-500/10 dark:bg-wc-green-500/20 text-wc-green-500 dark:text-wc-green-400',
    },
  ];


  const quickLinks = [
    {
      to: '/teams',
      icon: FiUsers,
      title: 'Đội Bóng',
      desc: 'Tham gia đội bóng phù hợp với trình độ hoặc tuyển thêm thành viên.',
      accent: 'from-wc-gold-500 to-wc-gold-600',
      iconColor: 'text-wc-gold-400',
    },
    {
      to: '/stadiums',
      icon: FiMapPin,
      title: 'Sân Bóng',
      desc: 'Kiểm tra lịch trống, so sánh giá cả và đặt sân ngay lập tức.',
      accent: 'from-wc-teal-500 to-wc-teal-600',
      iconColor: 'text-wc-teal-400',
    },
    {
      to: '/tournaments',
      icon: FiAward,
      title: 'Giải Đấu',
      desc: 'Tham gia các giải đấu hấp dẫn và thể hiện bản lĩnh của đội bạn.',
      accent: 'from-wc-red-500 to-wc-red-900',
      iconColor: 'text-wc-red-400',
    },
    {
      to: '/rankings',
      icon: FiTrendingUp,
      title: 'Bảng Xếp Hạng',
      desc: 'Theo dõi thứ hạng đội bóng của bạn và vươn lên đỉnh cao.',
      accent: 'from-wc-green-500 to-wc-green-600',
      iconColor: 'text-wc-green-400',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-wc-navy-950 font-sans selection:bg-wc-gold-500 selection:text-wc-navy-950 transition-colors duration-300">
      <PublicHeader />

      {/* ─── HERO SECTION — WORLD CUP 2026 ─── */}
      <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-20 lg:pt-28 lg:pb-40 overflow-hidden">
        {/* Stadium atmosphere background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/stadium_bg.png" 
            alt="Stadium Background" 
            className="absolute inset-0 w-full h-full object-cover object-center" 
          />
          {/* Overlay — harmonized for both modes */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 dark:from-wc-navy-950/90 dark:via-wc-navy-950/70 dark:to-wc-navy-950/90 backdrop-blur-[1px]"></div>
          {/* Decorative warm orbs */}
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-wc-gold-200/25 dark:bg-wc-gold-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-emerald-100/20 dark:bg-wc-teal-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-wc-gold-400/30 dark:border-wc-gold-500/30 text-wc-gold-700 dark:text-wc-gold-300 font-semibold text-sm mb-10 animate-fade-in-up shadow-lg shadow-black/5 dark:shadow-wc-gold-500/10">
              <span className="text-lg">⚽</span>
              Nền Tảng Đặt Sân - Tìm Đội Hàng Đầu
              <span className="text-lg">🏆</span>
            </div>

            {/* Heading */}
            <h1 className="font-sport text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8 animate-fade-in-up uppercase" style={{ animationDelay: '0.1s' }}>
              Kết Nối Đam Mê{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-wc-gold-600 via-amber-500 to-wc-gold-500 dark:from-wc-gold-400 dark:via-wc-gold-500 dark:to-wc-gold-300">
                Thể Thao Phong Trào
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Hòa mình vào không khí bóng đá cuồng nhiệt. Khám phá sân bóng, tìm kiếm đối thủ và tham gia các giải đấu hấp dẫn ngay hôm nay.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/matches" className="group font-sport flex items-center justify-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-lg tracking-wide uppercase text-white bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 shadow-lg shadow-wc-gold-500/25 dark:shadow-wc-gold-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                <FiPlay className="text-lg" />
                Tìm Trận Giao Hữu
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/stadiums" className="group font-sport flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg tracking-wide uppercase text-slate-700 dark:text-white bg-white/80 dark:bg-white/10 border border-slate-200/80 dark:border-white/20 backdrop-blur-sm hover:bg-white dark:hover:bg-white/15 hover:border-wc-gold-400 dark:hover:border-wc-gold-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                <FiMapPin className="text-lg text-wc-gold-600 dark:text-wc-gold-400" />
                Đặt Sân Ngay
                <FiChevronRight className="text-slate-400 dark:text-white/50 group-hover:text-wc-gold-600 dark:group-hover:text-wc-gold-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>


          </div>
        </div>
      </section>


      {/* ─── FEATURES SECTION ─── */}
      <section
        id="features"
        data-animate
        className="py-12 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50/80 to-amber-50/20 dark:from-wc-navy-950 dark:via-wc-navy-950 dark:to-wc-navy-900 relative overflow-hidden"
      >
        {/* Subtle accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-wc-gold-500 to-transparent"></div>
        {/* Decorative orbs — both modes */}
        <div className="absolute top-20 -left-20 w-[300px] h-[300px] bg-wc-gold-100/30 dark:bg-wc-gold-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 -right-20 w-[250px] h-[250px] bg-emerald-100/20 dark:bg-wc-teal-500/5 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-20 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wc-gold-700 dark:text-wc-gold-400 uppercase mb-4 bg-wc-gold-50 dark:bg-wc-gold-500/10 px-4 py-2 rounded-full border border-wc-gold-200 dark:border-wc-gold-500/20 shadow-sm">
              🏆 Tính Năng Vượt Trội
            </span>
            <h2 className="font-sport text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Trải Nghiệm Trọn Vẹn
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-wc-gold-600 via-amber-500 to-wc-red-500 dark:from-wc-gold-400 dark:via-wc-gold-500 dark:to-wc-red-400">Hệ Sinh Thái Bóng Đá</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group relative p-8 rounded-3xl bg-white/80 dark:bg-wc-navy-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-wc-navy-800/80 shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-2xl ${feature.glow} hover:-translate-y-2 transition-all duration-500 cursor-default ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${idx * 120 + 200}ms` }}
                >
                  {/* Top gradient line on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl`}></div>

                  <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${feature.iconBg} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="text-2xl" />
                  </div>
                  <h4 className="font-sport text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-wide">
                    {feature.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="explore"
        data-animate
        className="py-12 sm:py-20 lg:py-28 bg-gradient-to-br from-wc-navy-900 via-wc-navy-950 to-wc-navy-950 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-red-900/30 text-white relative overflow-hidden"
      >
        {/* Glowing orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-wc-gold-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-wc-teal-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-wc-red-500/5 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${isVisible('explore') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wc-gold-300 uppercase mb-4 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-wc-gold-500/20">
              ⚽ Khám Phá Ngay
            </span>
            <h2 className="font-sport text-3xl md:text-5xl font-bold tracking-tight mb-4 uppercase">
              Bạn Đang Tìm Kiếm
              <br />
              Điều Gì?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Hệ thống cung cấp đầy đủ thông tin chi tiết và cập nhật liên tục để đáp ứng mọi nhu cầu bóng đá của bạn.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.to}
                  className={`group relative p-7 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-wc-gold-500/30 ${isVisible('explore') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${idx * 100 + 200}ms` }}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`}></div>

                  <div className={`w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center ${item.iconColor} mb-5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500`}>
                    <Icon className="text-xl" />
                  </div>
                  <h4 className="font-sport text-xl font-bold mb-2 tracking-wide">{item.title}</h4>
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">{item.desc}</p>
                  <span className={`${item.iconColor} font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all`}>
                    Khám phá <FiArrowRight />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER — WORLD CUP ─── */}
      <section className="py-12 sm:py-20 lg:py-28 bg-gradient-to-b from-amber-50/30 via-white to-slate-50 dark:from-wc-navy-950 dark:via-wc-navy-950 dark:to-wc-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-wc-gold-200/30 dark:bg-wc-gold-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-rose-100/20 dark:bg-wc-red-500/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-wc-navy-950 dark:from-wc-navy-950 dark:via-wc-navy-900 dark:to-wc-red-900 rounded-[2rem] p-10 md:p-16 text-white shadow-2xl shadow-slate-900/40 dark:shadow-wc-navy-950/30 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-wc-gold-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-wc-teal-500/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <div className="text-5xl mb-6">🏆</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
                Sẵn sàng ra sân <br className="hidden sm:block" />cùng đồng đội?
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Đăng ký ngay hôm nay để trải nghiệm hệ sinh thái bóng đá phong trào hoàn chỉnh nhất tại Việt Nam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-wc-navy-950 bg-gradient-to-r from-wc-gold-400 to-wc-gold-500 hover:from-wc-gold-300 hover:to-wc-gold-400 shadow-lg shadow-wc-gold-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                  Tạo Tài Khoản Miễn Phí
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/matches" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white/90 bg-white/10 border border-white/20 hover:bg-white/15 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
                  Xem Trận Đấu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER — WC2026 ─── */}
      <footer className="bg-gradient-to-b from-slate-50 to-white dark:from-wc-navy-900/80 dark:to-wc-navy-900/80 border-t border-slate-200/80 dark:border-wc-navy-800 pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
                <img src="/favicon.png" alt="SportifyX Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">SportifyX</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto sm:mx-0 leading-relaxed">
                Nền tảng công nghệ giúp kết nối và phát triển cộng đồng bóng đá phong trào tại Việt Nam.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-5">Liên kết nhanh</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400">
                <li><Link to="/teams" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Tìm Đội Bóng</Link></li>
                <li><Link to="/stadiums" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Đặt Sân Bóng</Link></li>
                <li><Link to="/matches" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Lịch Thi Đấu</Link></li>
                <li><Link to="/tournaments" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Giải Đấu</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-5">Hỗ trợ</h4>
              <ul className="space-y-3 text-slate-500 dark:text-slate-400">
                <li><Link to="/contact" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Liên Hệ</Link></li>
                <li><Link to="/privacy" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Bảo Mật</Link></li>
                <li><Link to="/terms" className="hover:text-wc-gold-600 dark:hover:text-wc-gold-400 transition-colors">Điều Khoản</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-200/80 dark:border-wc-navy-800 text-slate-400 dark:text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} SportifyX — Nền Tảng Kết Nối Thể Thao ⚽🏆</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-wc-gold-500 dark:bg-wc-navy-800 flex items-center justify-center text-slate-400 hover:text-white dark:text-slate-400 dark:hover:bg-wc-gold-500 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-wc-gold-500 dark:bg-wc-navy-800 flex items-center justify-center text-slate-400 hover:text-white dark:text-slate-400 dark:hover:bg-wc-gold-500 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-wc-gold-500 dark:bg-wc-navy-800 flex items-center justify-center text-slate-400 hover:text-white dark:text-slate-400 dark:hover:bg-wc-gold-500 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
