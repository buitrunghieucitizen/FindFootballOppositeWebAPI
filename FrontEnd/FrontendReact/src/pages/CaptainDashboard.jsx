import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { publicService } from '../services/publicService';
import {
  FiLogOut, FiUsers, FiTarget, FiMapPin, FiCalendar, FiHome, FiGrid,
  FiTrendingUp, FiAward, FiChevronDown, FiUser, FiMessageSquare, FiDollarSign, FiSun, FiMoon, FiSearch, FiSettings, FiEdit
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import OverviewTab from './captain/OverviewTab';
import MembersTab from './captain/MembersTab';
import MatchesTab from './captain/MatchesTab';
import StadiumsTab from './captain/StadiumsTab';
import BookingHistoryTab from './captain/BookingHistoryTab';
import PostsTab from './captain/PostsTab';
import RankingsTab from './captain/RankingsTab';
import CreateTeamTab from './captain/CreateTeamTab';
import CaptainPremiumTab from './captain/CaptainPremiumTab';
import TournamentsTab from './captain/TournamentsTab';
import TeamList_Captain from './captain/TeamList_Captain';
import PlayerTournamentsTab from './player/PlayerTournamentsTab';
import ProfileTab from './common/ProfileTab';
import DirectMessagesTab from './common/DirectMessagesTab';

import { captainService } from '../services/captainService';
import { DashboardLayout, DashboardSidebar } from '../components/portal-ui';
import NotificationBell from '../components/NotificationBell';
import MessageBell from '../components/MessageBell';

export default function CaptainDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [team, setTeam] = useState(null);
  const [hideOnboarding, setHideOnboarding] = useState(localStorage.getItem('hideOnboarding') === 'true');

  const toggleOnboarding = () => {
    const newVal = !hideOnboarding;
    setHideOnboarding(newVal);
    localStorage.setItem('hideOnboarding', newVal.toString());
  };

  useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const myTeam = await captainService.getMyTeam();
      setTeam(myTeam);
    } catch (teamErr) {
      // Nếu API trả về 404 (chưa có đội) thì set team = null để hiện trang Tạo Đội
      console.warn('Chưa có đội bóng hoặc lỗi:', teamErr.message);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = () => {
    loadData();
    setActiveTab('overview');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  const stats = [
    { icon: FiUsers, label: 'Thành viên', value: team?.memberCount?.toString() || '0', grad: 'bg-emerald-50 text-emerald-600', trend: 'Đang hoạt động' },
    { icon: FiTrendingUp, label: 'Tỷ lệ thắng', value: `${team?.winRate || 0}%`, grad: 'bg-emerald-50 text-emerald-600', trend: team?.winRate >= 50 ? 'Phong độ cao' : 'Cần cố gắng' },
    { icon: FiAward, label: 'Fairplay', value: team?.fairplayScore?.toString() || '100', grad: 'bg-emerald-50 text-emerald-600', trend: team?.fairplayScore >= 80 ? 'Rất tốt' : 'Trung bình' },
    { icon: FiCalendar, label: 'Kèo tiếp theo', value: team?.nextMatchDate || 'Chưa có', grad: 'bg-emerald-50 text-emerald-600', trend: team?.nextMatchTrend || '' },
  ];

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: FiGrid },
    { id: 'members', label: 'Thành Viên', icon: FiUsers },
    { id: 'matches', label: 'Kèo Đấu', icon: FiCalendar },
    { id: 'tournaments', label: 'Giải Đấu', icon: FiAward },
    { id: 'stadiums', label: 'Tìm Sân', icon: FiMapPin },
    { id: 'booking-history', label: 'Lịch sử đặt sân', icon: FiCalendar },
    { id: 'posts', label: 'Đăng Bài', icon: FiEdit },
    { id: 'rankings', label: 'Bảng xếp hạng', icon: FiTrendingUp },
    { id: 'teams', label: 'Danh sách đội', icon: FiUsers },
    { id: 'messages', label: 'Tin Nhắn', icon: FiMessageSquare },
  ];

  const sidebar = (
    <DashboardSidebar
      brandLabel="SportifyX"
      subLabel="Captain Panel"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      userRole={user?.role}
    />
  );

  const topBar = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-4 md:mb-8 w-full">
      <div className="w-full md:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.username || 'Đội Trưởng'}! 🏆</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trang chủ quản lý đội thể thao và các trận đấu</p>
      </div>
      <div className="relative flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">

        <MessageBell />
        <NotificationBell />
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="user-menu-btn flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 rounded-full pl-2 pr-3 sm:pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm">
            {initials(user?.username || 'CP')}
          </div>
          <div className="text-left flex flex-col hidden sm:flex">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Captain'}</strong>
            <span className="text-emerald-600 text-[10px] font-bold uppercase">{user?.role || 'Captain'}</span>
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

  const tutorialSteps = [
    {
      target: 'body',
      content: 'Chào mừng Đội trưởng đến với SportifyX! Hãy cùng xem qua các tính năng quản lý nhé.',
      placement: 'center',
    },
    {
      target: '.user-menu-btn',
      content: 'Cài đặt tài khoản của bạn. (Có thể tắt hướng dẫn trong Cài đặt ứng dụng)',
      placement: 'bottom',
    },
    {
      target: '.sidebar-nav',
      content: 'Menu quản lý chính: đăng bài, tìm kèo, tạo giải đấu, v.v.',
      placement: 'right',
    },
  ];

  return (
    <DashboardLayout sidebar={sidebar} topBar={topBar}>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* Stats */}
      {activeTab === 'overview' && team && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.grad}`}>
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{s.trend}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'profile' ? (
          <ProfileTab />
        ) : activeTab === 'messages' ? (
          <DirectMessagesTab />
        ) : !team ? (
          <CreateTeamTab onTeamCreated={handleTeamCreated} />
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            { activeTab === 'members' && <MembersTab /> }
            { activeTab === 'matches' && <MatchesTab setActiveTab={setActiveTab} /> }
            { activeTab === 'tournaments' && <TournamentsTab /> }
            { activeTab === 'stadiums' && <StadiumsTab /> }
            { activeTab === 'booking-history' && <BookingHistoryTab /> }
            {activeTab === 'posts' && <PostsTab />}
            {activeTab === 'rankings' && <RankingsTab />}
            {activeTab === 'teams' && <TeamList_Captain setActiveTab={setActiveTab} />}
            {activeTab === 'premium' && <CaptainPremiumTab />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
