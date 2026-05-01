import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Loading, Alert, Table } from '../components';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUsers, FiTarget, FiMapPin, FiCalendar, FiPlus, FiSearch, FiHome, FiGrid, FiChevronRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.role === 'Admin' && isAuthenticated) loadData();
  }, [user, isAuthenticated]);

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [u, t, s, m] = await Promise.all([
        adminService.getUsers('', 1), adminService.getTeams('', 1),
        adminService.getStadiums('', 1), adminService.getMatches('', 1),
      ]);
      setUsers(u || []); setTeams(t || []); setStadiums(s || []); setMatches(m || []);
    } catch (err) { setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.'); console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  const stats = [
    { icon: FiUsers, label: 'Người dùng', value: users.length, grad: 'from-blue-500 to-cyan-400' },
    { icon: FiTarget, label: 'Đội bóng', value: teams.length, grad: 'from-emerald-500 to-teal-400' },
    { icon: FiMapPin, label: 'Sân bóng', value: stadiums.length, grad: 'from-violet-500 to-purple-400' },
    { icon: FiCalendar, label: 'Trận đấu', value: matches.length, grad: 'from-orange-500 to-amber-400' },
  ];

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: FiGrid },
    { id: 'users', label: 'Người Dùng', icon: FiUsers },
    { id: 'teams', label: 'Đội Bóng', icon: FiTarget },
    { id: 'stadiums', label: 'Sân Bóng', icon: FiMapPin },
    { id: 'matches', label: 'Trận Đấu', icon: FiCalendar },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-[280px] shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto z-40">
        {/* Brand */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/30">
              FF
            </div>
            <div>
              <strong className="block text-white text-lg font-black tracking-tight leading-tight">FindFootball</strong>
              <span className="block text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em]">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.1] transition-colors">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20">
              {initials(user?.username || 'AD')}
            </div>
            <div className="min-w-0">
              <strong className="block text-white font-bold text-sm truncate">{user?.username || 'Admin'}</strong>
              <span className="inline-block mt-1 px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-md text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-3">Menu Quản Trị</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSearchTerm(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative ${
                    active
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 shadow-lg shadow-teal-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-r-full" />}
                  <Icon className={`text-lg ${active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                  {active && <FiChevronRight className="ml-auto text-teal-500 text-sm" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-4 mt-auto space-y-2 border-t border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl font-semibold text-sm transition-all">
            <FiHome className="text-lg" /> Về Trang Chủ
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-semibold text-sm transition-all">
            <FiLogOut className="text-lg" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-8 overflow-x-hidden relative">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none" />

        {error && <Alert type="error" title="Lỗi" message={error} onClose={() => setError('')} className="mb-6" />}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${s.grad} opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`} />
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${s.grad} text-white shadow-lg`}>
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-black text-slate-800">{s.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-sm min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loading /></div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center mb-4">
                    <FiGrid className="text-3xl" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Chào mừng đến Bảng Điều Khiển</h2>
                  <p className="text-slate-500 max-w-md text-sm">Chọn một mục từ menu bên trái để quản lý người dùng, đội bóng, sân bóng hoặc trận đấu.</p>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Quản lý Người Dùng</h2>
                      <p className="text-sm text-slate-500">Danh sách tài khoản hệ thống</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none w-56 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Button variant="primary" onClick={() => navigate('/admin/users/create')} className="flex items-center gap-2 rounded-xl"><FiPlus /> Thêm Mới</Button>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <Table
                      columns={[
                        { key: 'username', label: 'Tên đăng nhập' },
                        { key: 'fullName', label: 'Họ và tên' },
                        { key: 'phone', label: 'Số điện thoại' },
                        { key: 'roles', label: 'Vai trò', render: (roles) => (
                          <div className="flex gap-1 flex-wrap">
                            {roles?.map((r, i) => (
                              <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs font-bold border border-teal-100">{r.roleName || r.name || r}</span>
                            ))}
                          </div>
                        )},
                      ]}
                      data={users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))}
                      actions={(row) => [
                        <Button key="edit" variant="secondary" size="sm" className="rounded-lg" onClick={() => navigate(`/admin/users/${row.userId}/edit`)}>Sửa</Button>,
                        <Button key="delete" variant="danger" size="sm" className="rounded-lg" onClick={() => { if (confirm(`Xóa tài khoản ${row.username}?`)) adminService.deleteUser(row.userId).then(() => loadData()); }}>Xóa</Button>,
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Quản lý Đội Bóng</h2>
                      <p className="text-sm text-slate-500">Danh sách các đội tham gia</p>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/admin/teams/create')} className="flex items-center gap-2 rounded-xl"><FiPlus /> Thêm Đội Mới</Button>
                  </div>
                  <div className="table-wrap">
                    <Table
                      columns={[
                        { key: 'teamName', label: 'Tên đội', render: (name) => <span className="font-bold text-teal-700">{name}</span> },
                        { key: 'city', label: 'Thành phố' },
                        { key: 'foundedYear', label: 'Năm thành lập' },
                        { key: 'qualityLevel', label: 'Trình độ', render: (level) => (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold">{level || 'N/A'}</span>
                        )},
                      ]}
                      data={teams}
                      actions={(row) => [
                        <Button key="edit" variant="secondary" size="sm" className="rounded-lg" onClick={() => navigate(`/admin/teams/${row.teamId}/edit`)}>Sửa</Button>,
                        <Button key="delete" variant="danger" size="sm" className="rounded-lg" onClick={() => { if (confirm('Xóa đội này?')) adminService.deleteTeam(row.teamId).then(() => loadData()); }}>Xóa</Button>,
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'stadiums' && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Quản lý Sân Bóng</h2>
                      <p className="text-sm text-slate-500">Danh sách các sân thi đấu</p>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/admin/stadiums/create')} className="flex items-center gap-2 rounded-xl"><FiPlus /> Thêm Sân Mới</Button>
                  </div>
                  <div className="table-wrap">
                    <Table
                      columns={[
                        { key: 'stadiumName', label: 'Tên sân', render: (name) => <span className="font-bold text-slate-800">{name}</span> },
                        { key: 'address', label: 'Địa chỉ' },
                        { key: 'hotline', label: 'Hotline', render: (val) => <span className="font-mono text-slate-600">{val || 'N/A'}</span> },
                      ]}
                      data={stadiums}
                      actions={(row) => [
                        <Button key="edit" variant="secondary" size="sm" className="rounded-lg" onClick={() => navigate(`/admin/stadiums/${row.stadiumId}/edit`)}>Sửa</Button>,
                        <Button key="delete" variant="danger" size="sm" className="rounded-lg" onClick={() => { if (confirm('Xóa sân này?')) adminService.deleteStadium(row.stadiumId).then(() => loadData()); }}>Xóa</Button>,
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'matches' && (
                <div className="animate-fade-in">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Quản lý Trận Đấu</h2>
                      <p className="text-sm text-slate-500">Lịch thi đấu và kết quả</p>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/admin/matches/create')} className="flex items-center gap-2 rounded-xl"><FiPlus /> Tạo Trận Mới</Button>
                  </div>
                  <div className="table-wrap">
                    <Table
                      columns={[
                        { key: 'matchDate', label: 'Ngày', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
                        { key: 'homeTeam', label: 'Đội nhà', render: (t) => t?.teamName || 'N/A' },
                        { key: 'awayTeam', label: 'Đội khách', render: (t) => t?.teamName || 'N/A' },
                        { key: 'matchStatus', label: 'Trạng thái', render: (s) => (
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                            s === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            s === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>{s === 'Completed' ? 'Đã đá' : s === 'Scheduled' ? 'Sắp đá' : s}</span>
                        )},
                      ]}
                      data={matches}
                      actions={(row) => [
                        <Button key="edit" variant="secondary" size="sm" className="rounded-lg" onClick={() => navigate(`/admin/matches/${row.matchId}/edit`)}>Sửa</Button>,
                        <Button key="delete" variant="danger" size="sm" className="rounded-lg" onClick={() => { if (confirm('Xóa trận này?')) adminService.deleteMatch(row.matchId).then(() => loadData()); }}>Xóa</Button>,
                      ]}
                    />
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
