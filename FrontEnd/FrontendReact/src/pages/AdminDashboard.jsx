import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button, Loading, Alert, Table } from '../components';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { directMessageService } from '../services/directMessageService';
import { FiLogOut, FiUsers, FiTarget, FiMapPin, FiCalendar, FiPlus, FiSearch, FiHome, FiGrid, FiChevronDown, FiBarChart2, FiAward, FiUser, FiSun, FiMoon, FiMessageSquare, FiDollarSign, FiSettings } from 'react-icons/fi';
import AdminRevenueTab from './admin/AdminRevenueTab';
import TournamentsTab from './admin/TournamentsTab';
import ProfileTab from './common/ProfileTab';
import AdminPostsTab from './admin/AdminPostsTab';
import AdminWithdrawalsTab from './admin/AdminWithdrawalsTab';
import AdminFeedbacksTab from './admin/AdminFeedbacksTab';
import DirectMessagesTab from './common/DirectMessagesTab';
import { DashboardLayout, DashboardSidebar } from '../components/portal-ui';
import NotificationBell from '../components/NotificationBell';
import MessageBell from '../components/MessageBell';

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hideOnboarding, setHideOnboarding] = useState(localStorage.getItem('hideOnboarding') === 'true');

  const toggleOnboarding = () => {
    const newVal = !hideOnboarding;
    setHideOnboarding(newVal);
    localStorage.setItem('hideOnboarding', newVal.toString());
  };

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  
  const [teams, setTeams] = useState([]);
  const [teamPage, setTeamPage] = useState(1);
  const [teamTotalPages, setTeamTotalPages] = useState(1);

  const [stadiums, setStadiums] = useState([]);
  const [stadiumPage, setStadiumPage] = useState(1);
  const [stadiumTotalPages, setStadiumTotalPages] = useState(1);
  const [stadiumMonth, setStadiumMonth] = useState(new Date().getMonth() + 1);
  const [stadiumYear, setStadiumYear] = useState(new Date().getFullYear());

  const [matches, setMatches] = useState([]);
  const [matchPage, setMatchPage] = useState(1);
  const [matchTotalPages, setMatchTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('');
  const [formData, setFormData] = useState({});
  const [editData, setEditData] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleOpenCreate = (type, data = null) => {
    setCreateType(type);
    setEditData(data);
    if (data) {
      setFormData({ ...data, role: data.roles?.[0]?.roleName || 'Player' });
    } else {
      setFormData({ role: 'Player' }); // Default role
    }
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (createType === 'users') {
        const payload = {
          username: formData.username,
          fullName: formData.fullName,
          phone: formData.phone || '0000000000',
          roles: [formData.role || 'Player']
        };
        if (!editData) payload.password = formData.password || '123456';
        if (editData) await adminService.updateUser(editData.userId, payload);
        else await adminService.createUser(payload);
      } else if (createType === 'teams') {
        const payload = {
          teamName: formData.teamName,
          qualityLevel: formData.qualityLevel || 'Trung bình',
          sportId: 1,
          captainId: formData.captainId ? parseInt(formData.captainId) : (user?.userId || 1)
        };
        if (editData) await adminService.updateTeam(editData.teamId, payload);
        else await adminService.createTeam(payload);
      } else if (createType === 'stadiums') {
        const payload = {
          stadiumName: formData.stadiumName,
          address: formData.address,
          ownerId: formData.ownerId || user?.userId || 1,
          pitches: []
        };
        if (editData) await adminService.updateStadium(editData.stadiumId, payload);
        else await adminService.createStadium(payload);
      }
      setShowCreateModal(false);
      loadData();
      alert(editData ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const isAdmin = Array.isArray(user?.role) ? user.role.includes('Admin') : user?.role === 'Admin';
    if (isAdmin && isAuthenticated) loadData();
  }, [user, isAuthenticated, activeTab, userPage, teamPage, stadiumPage, matchPage, stadiumMonth, stadiumYear]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (['users', 'teams', 'stadiums', 'matches'].includes(activeTab)) {
        if (activeTab === 'users') setUserPage(1);
        if (activeTab === 'teams') setTeamPage(1);
        if (activeTab === 'stadiums') setStadiumPage(1);
        if (activeTab === 'matches') setMatchPage(1);
        loadData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      if (activeTab === 'users' || activeTab === 'overview') {
        const u = await adminService.getUsers(searchTerm, userPage);
        setUsers(u?.items || u || []); 
        if (u?.totalPages) setUserTotalPages(u.totalPages);
      }
      if (activeTab === 'teams' || activeTab === 'overview') {
        const t = await adminService.getTeams(searchTerm, teamPage);
        setTeams(t?.items || t || []);
        if (t?.totalPages) setTeamTotalPages(t.totalPages);
      }
      if (activeTab === 'stadiums' || activeTab === 'overview') {
        const s = await adminService.getStadiums(searchTerm, stadiumPage, stadiumMonth, stadiumYear);
        setStadiums(s?.items || s || []);
        if (s?.totalPages) setStadiumTotalPages(s.totalPages);
      }
      if (activeTab === 'matches' || activeTab === 'overview') {
        const m = await adminService.getMatches(searchTerm, matchPage);
        setMatches(m?.items || m || []);
        if (m?.totalPages) setMatchTotalPages(m.totalPages);
      }
    } catch (err) { 
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.'); 
      console.error(err); 
    }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: FiGrid },
    { id: 'users', label: 'Người Dùng', icon: FiUsers },
    { id: 'teams', label: 'Đội Thể Thao', icon: FiTarget },
    { id: 'stadiums', label: 'Sân Bãi', icon: FiMapPin },
    { id: 'matches', label: 'Trận Đấu', icon: FiCalendar },
    { id: 'posts', label: 'Bài Viết', icon: FiMessageSquare },
    { id: 'withdrawals', label: 'Yêu cầu Rút tiền', icon: FiDollarSign },
    { id: 'tournaments', label: 'Giải Đấu', icon: FiAward },
    { id: 'feedbacks', label: 'Quản lý Góp ý', icon: FiMessageSquare },
    { id: 'messages', label: 'Tin Nhắn', icon: FiMessageSquare },
  ];

  const sidebar = (
    <DashboardSidebar
      brandLabel="SportifyX"
      subLabel="Admin Panel"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={(id) => { setActiveTab(id); setSearchTerm(''); }}
      onLogout={handleLogout}
      userRole={user?.role}
    />
  );

  const topBar = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-4 md:mb-8 w-full">
      <div className="w-full md:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Xin chào, {user?.username || 'Admin'}! 🛡️</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trang chủ quản trị hệ thống</p>
      </div>
      <div className="relative flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">

        <MessageBell />
        <NotificationBell />
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 rounded-full pl-2 pr-3 sm:pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm">
            {initials(user?.username || 'AD')}
          </div>
          <div className="text-left flex flex-col hidden sm:flex">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Admin'}</strong>
            <span className="text-emerald-600 text-[10px] font-bold uppercase">{user?.role || 'Admin'}</span>
          </div>
          <FiChevronDown className="text-slate-400 ml-0.5 sm:ml-1" />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
            <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiUser className="text-slate-400" /> Thông tin cá nhân
            </button>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiHome className="text-slate-400" /> Trang chủ
            </Link>
            <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <div className="flex items-center gap-2">
                {isDark ? <FiSun className="text-slate-400" /> : <FiMoon className="text-slate-400" />} Giao diện
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500">{isDark ? 'Tối' : 'Sáng'}</span>
            </button>
            <button onClick={toggleOnboarding} className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <div className="flex items-center gap-2">
                <FiSettings className="text-slate-400" /> Hướng dẫn
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500">{hideOnboarding ? 'Tắt' : 'Bật'}</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <FiLogOut className="text-red-400" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={sidebar} topBar={topBar}>
      {error && <Alert type="error" title="Lỗi" message={error} onClose={() => setError('')} className="mb-6 rounded-xl" />}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64"><Loading /></div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <AdminRevenueTab />
              </div>
            )}

            {activeTab === 'profile' && <ProfileTab />}

            {activeTab === 'users' && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quản lý Người Dùng</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách tài khoản hệ thống</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full sm:w-56 transition-all dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="primary" onClick={() => handleOpenCreate('users')} className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"><FiPlus /> Thêm Mới</Button>
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
                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-100">{r.roleName || r.name || r}</span>
                          ))}
                        </div>
                      )},
                    ]}
                    data={users}
                    actions={(row) => [
                      <button key="msg" className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-200 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={async () => {
                        try {
                          await directMessageService.sendMessage(row.userId, "Xin chào từ Admin hệ thống.");
                          alert('Đã gửi tin nhắn tự động. Chuyển sang tab Tin Nhắn để tiếp tục trò chuyện.');
                          setActiveTab('messages');
                        } catch (err) { alert('Lỗi: ' + err.message); }
                      }}>Nhắn tin</button>,
                      <button key="edit" className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-600" onClick={() => handleOpenCreate('users', row)}>Sửa</button>,
                      <button key="delete" className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => { if (confirm('Xóa người dùng này?')) adminService.deleteUser(row.userId).then(() => loadData()); }}>Xóa</button>,
                    ]}
                  />
                  {userTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button 
                        disabled={userPage === 1} 
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Trang {userPage} / {userTotalPages}
                      </span>
                      <button 
                        disabled={userPage === userTotalPages} 
                        onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quản lý Đội Bóng</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các đội tham gia</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Tìm kiếm đội..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full sm:w-56 transition-all dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => handleOpenCreate('teams')} className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-medium"><FiPlus /> Thêm Đội Mới</button>
                  </div>
                </div>
                <div className="table-wrap">
                  <Table
                    columns={[
                      { key: 'teamName', label: 'Tên đội', render: (name) => <span className="font-bold text-emerald-700">{name}</span> },
                      { key: 'city', label: 'Thành phố' },
                      { key: 'foundedYear', label: 'Năm thành lập' },
                      { key: 'qualityLevel', label: 'Trình độ', render: (level) => (
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-semibold">{level || 'N/A'}</span>
                      )},
                    ]}
                    data={teams}
                    actions={(row) => [
                      <button key="edit" className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-600" onClick={() => handleOpenCreate('teams', row)}>Sửa</button>,
                      <button key="delete" className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => { if (confirm('Xóa đội này?')) adminService.deleteTeam(row.teamId).then(() => loadData()); }}>Xóa</button>,
                    ]}
                  />
                  {teamTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button 
                        disabled={teamPage === 1} 
                        onClick={() => setTeamPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Trang {teamPage} / {teamTotalPages}
                      </span>
                      <button 
                        disabled={teamPage === teamTotalPages} 
                        onClick={() => setTeamPage(p => Math.min(teamTotalPages, p + 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stadiums' && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quản lý Sân Bóng</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các sân thi đấu</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex gap-2">
                      <select 
                        value={stadiumMonth} 
                        onChange={(e) => setStadiumMonth(parseInt(e.target.value))}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:text-white"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>Tháng {m}</option>
                        ))}
                      </select>
                      <select 
                        value={stadiumYear} 
                        onChange={(e) => setStadiumYear(parseInt(e.target.value))}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:text-white"
                      >
                        {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                          <option key={y} value={y}>Năm {y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Tìm kiếm sân bóng..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full sm:w-56 transition-all dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => handleOpenCreate('stadiums')} className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-medium"><FiPlus /> Thêm Sân Mới</button>
                  </div>
                </div>
                <div className="table-wrap">
                  <Table
                    columns={[
                      { key: 'stadiumName', label: 'Tên sân', render: (name) => <span className="font-bold text-slate-800 dark:text-white">{name}</span> },
                      { key: 'address', label: 'Địa chỉ' },
                      { key: 'hotline', label: 'Hotline', render: (val) => <span className="font-mono text-slate-600 dark:text-slate-300">{val || 'N/A'}</span> },
                      { key: 'monthlyBookingCount', label: `Lượt đặt (T${stadiumMonth}/${stadiumYear})`, render: (val) => <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{val || 0} lượt</span> },
                      { key: 'totalBookingCount', label: 'Tổng số lượt đặt', render: (val) => <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">{val || 0} lượt</span> },
                    ]}
                    data={stadiums}
                    actions={(row) => [
                      <button key="edit" className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-600" onClick={() => handleOpenCreate('stadiums', row)}>Sửa</button>,
                      <button key="delete" className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => { if (confirm('Xóa sân này?')) adminService.deleteStadium(row.stadiumId).then(() => loadData()); }}>Xóa</button>,
                    ]}
                  />
                  {stadiumTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button 
                        disabled={stadiumPage === 1} 
                        onClick={() => setStadiumPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Trang {stadiumPage} / {stadiumTotalPages}
                      </span>
                      <button 
                        disabled={stadiumPage === stadiumTotalPages} 
                        onClick={() => setStadiumPage(p => Math.min(stadiumTotalPages, p + 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quản lý Trận Đấu</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Lịch thi đấu và kết quả</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Tìm kiếm đội, trạng thái..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full sm:w-56 transition-all dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="table-wrap">
                  <Table
                    columns={[
                      { key: 'schedule', label: 'Ngày', render: (s) => s?.startTime ? new Date(s.startTime).toLocaleDateString('vi-VN') : 'Chưa xếp lịch' },
                      { key: 'homeTeamName', label: 'Đội nhà', render: (name) => name || 'N/A' },
                      { key: 'awayTeamName', label: 'Đội khách', render: (name) => name || 'N/A' },
                      { key: 'matchStatus', label: 'Trạng thái', render: (s) => (
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                          s === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          s === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>{s === 'Completed' ? 'Đã đá' : s === 'Scheduled' ? 'Sắp đá' : s || 'Chưa rõ'}</span>
                      )},
                    ]}
                    data={matches}
                    actions={(row) => [
                      <button key="delete" className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => { if (confirm('Xóa trận này?')) adminService.deleteMatch(row.matchId).then(() => loadData()); }}>Xóa</button>,
                    ]}
                  />
                  {matchTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button 
                        disabled={matchPage === 1} 
                        onClick={() => setMatchPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Trang {matchPage} / {matchTotalPages}
                      </span>
                      <button 
                        disabled={matchPage === matchTotalPages} 
                        onClick={() => setMatchPage(p => Math.min(matchTotalPages, p + 1))}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'posts' && <AdminPostsTab />}
            {activeTab === 'tournaments' && <TournamentsTab />}
            {activeTab === 'withdrawals' && <AdminWithdrawalsTab />}
            {activeTab === 'feedbacks' && <AdminFeedbacksTab />}
            {activeTab === 'messages' && <DirectMessagesTab />}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
              {editData ? 'Cập nhật ' : 'Thêm '}
              {createType === 'users' ? 'Người Dùng' : createType === 'teams' ? 'Đội Bóng' : 'Sân Bóng'}
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {createType === 'users' && (
                <>
                  <input type="text" placeholder="Tên đăng nhập" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} disabled={!!editData} />
                  {!editData && <input type="password" placeholder="Mật khẩu (mặc định 123456)" className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />}
                  <input type="text" placeholder="Họ và tên" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  <input type="text" placeholder="Số điện thoại" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  <select
                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                    value={formData.role || 'Player'}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Player">Cầu thủ (Player)</option>
                    <option value="Captain">Đội trưởng (Captain)</option>
                    <option value="StadiumOwner">Chủ sân (StadiumOwner)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </>
              )}
              {createType === 'teams' && (
                <>
                  <input type="text" placeholder="Tên đội bóng" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.teamName || ''} onChange={e => setFormData({...formData, teamName: e.target.value})} />
                  <input type="text" placeholder="Trình độ (VD: Trung bình)" className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.qualityLevel || ''} onChange={e => setFormData({...formData, qualityLevel: e.target.value})} />
                  {!editData && <input type="number" placeholder="ID Đội trưởng (Mặc định: Bạn)" className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.captainId || ''} onChange={e => setFormData({...formData, captainId: e.target.value})} />}
                </>
              )}
              {createType === 'stadiums' && (
                <>
                  <input type="text" placeholder="Tên sân bóng" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.stadiumName || ''} onChange={e => setFormData({...formData, stadiumName: e.target.value})} />
                  <input type="text" placeholder="Địa chỉ" required className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none dark:bg-slate-700 dark:text-white dark:placeholder-slate-500" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                </>
              )}
              <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
