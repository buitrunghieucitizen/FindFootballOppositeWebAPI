import { Link } from 'react-router-dom';
import { FiTarget, FiMapPin, FiCalendar, FiUsers, FiArrowRight, FiShield, FiStar, FiActivity } from 'react-icons/fi';
import { PublicHeader } from '../components/portal-ui';

export default function HomePage() {
  const features = [
    {
      icon: FiUsers,
      title: 'Quản lý đội bóng',
      description: 'Dễ dàng tạo, quản lý và xây dựng đội bóng của bạn với các công cụ chuyên nghiệp.',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      icon: FiMapPin,
      title: 'Tìm sân bóng',
      description: 'Khám phá và đặt sân bóng chất lượng cao gần khu vực của bạn trong vài giây.',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      icon: FiCalendar,
      title: 'Lên lịch thi đấu',
      description: 'Sắp xếp lịch thi đấu, gửi lời mời và theo dõi kết quả một cách trực quan.',
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: FiTarget,
      title: 'Tuyển quân',
      description: 'Đăng tin tuyển dụng và tìm kiếm những cầu thủ tài năng cho đội hình của bạn.',
      color: 'from-rose-400 to-pink-500'
    },
  ];

  const stats = [
    { label: 'Đội Bóng Đăng Ký', value: '1,200+', icon: FiShield },
    { label: 'Trận Đấu Đã Tổ Chức', value: '8,500+', icon: FiActivity },
    { label: 'Sân Bóng Đối Tác', value: '350+', icon: FiMapPin },
    { label: 'Đánh Giá Tích Cực', value: '4.9/5', icon: FiStar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/40 blur-[100px] mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-200/40 blur-[100px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[100px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-teal-100 backdrop-blur-sm text-teal-700 font-medium text-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              Nền tảng bóng đá phong trào số 1 Việt Nam
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Kết Nối Đam Mê <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">
                Lan Tỏa Tinh Thần Bức Phá
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              FindFootball giúp bạn dễ dàng tìm kiếm đội bóng, đặt sân và tổ chức các trận đấu giao hữu một cách chuyên nghiệp và nhanh chóng nhất.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/matches">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-white bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                  Tìm Trận Giao Hữu <FiArrowRight />
                </button>
              </Link>
              <Link to="/stadiums">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-slate-700 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                  Đặt Sân Ngay
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200/60 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 text-teal-600 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-sm font-bold tracking-widest text-teal-600 uppercase mb-3">Tính Năng Vượt Trội</h3>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Trải Nghiệm Trọn Vẹn Hệ Sinh Thái
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-teal-900/5 hover:-translate-y-2 transition-all duration-500">
                  <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-lg shadow-${feature.color.split('-')[1]}-500/30 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="text-2xl" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Bạn Đang Tìm Kiếm<br/>Điều Gì?</h2>
              <p className="text-slate-400 text-lg mb-8">
                Hệ thống cung cấp đầy đủ thông tin chi tiết và cập nhật liên tục để đáp ứng mọi nhu cầu bóng đá của bạn.
              </p>
            </div>
            
            <Link to="/teams" className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <FiUsers className="text-xl" />
              </div>
              <h4 className="text-2xl font-bold mb-3">Đội Bóng</h4>
              <p className="text-slate-400 mb-6">Tham gia các đội bóng phù hợp với trình độ hoặc tuyển thêm thành viên cho đội của bạn.</p>
              <span className="text-teal-400 font-semibold group-hover:text-teal-300 flex items-center gap-2">Khám phá ngay <FiArrowRight /></span>
            </Link>

            <Link to="/stadiums" className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <FiMapPin className="text-xl" />
              </div>
              <h4 className="text-2xl font-bold mb-3">Sân Bóng</h4>
              <p className="text-slate-400 mb-6">Kiểm tra lịch trống, so sánh giá cả và đặt sân ngay lập tức với hệ thống realtime.</p>
              <span className="text-cyan-400 font-semibold group-hover:text-cyan-300 flex items-center gap-2">Tìm sân ngay <FiArrowRight /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                  FF
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">FindFootball</h1>
              </div>
              <p className="text-slate-500 max-w-sm mx-auto sm:mx-0">
                Nền tảng công nghệ giúp kết nối và phát triển cộng đồng bóng đá phong trào tại Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Liên kết nhanh</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link to="/teams" className="hover:text-teal-600">Tìm Đội Bóng</Link></li>
                <li><Link to="/stadiums" className="hover:text-teal-600">Đặt Sân Bóng</Link></li>
                <li><Link to="/matches" className="hover:text-teal-600">Lịch Thi Đấu</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Hỗ trợ</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link to="/contact" className="hover:text-teal-600">Liên Hệ</Link></li>
                <li><Link to="/privacy" className="hover:text-teal-600">Bảo Mật</Link></li>
                <li><Link to="/terms" className="hover:text-teal-600">Điều Khoản</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} FindFootball. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-teal-600">Facebook</span>
              <span className="cursor-pointer hover:text-teal-600">Instagram</span>
              <span className="cursor-pointer hover:text-teal-600">Twitter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
