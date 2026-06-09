import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiLogOut, FiMenu, FiCheckSquare, FiChevronDown, FiDollarSign, FiBarChart2, FiAward, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import MyStadiumsTab from './owner/MyStadiumsTab';
import BookingManagementTab from './owner/BookingManagementTab';
import OwnerRevenueTab from './owner/OwnerRevenueTab';
import OwnerTimelineTab from './owner/OwnerTimelineTab';
import OwnerTournamentsTab from './owner/OwnerTournamentsTab';
import DirectMessagesTab from './common/DirectMessagesTab';
import ProfileTab from './common/ProfileTab';
import { DashboardLayout, DashboardSidebar } from '../components/portal-ui';
import { FiClock, FiInfo, FiMessageSquare } from 'react-icons/fi';
import NotificationBell from '../components/NotificationBell';
import MessageBell from '../components/MessageBell';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

export default function StadiumOwnerDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'stadiums';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const renderContent = () => {
    switch (activeTab) {
      case 'stadiums':
        return <MyStadiumsTab />;
      case 'bookings':
        return <BookingManagementTab />;
      case 'revenue':
        return <OwnerRevenueTab />;
      case 'timeline':
        return <OwnerTimelineTab />;
      case 'tournaments':
        return <OwnerTournamentsTab />;
      case 'messages':
        return <DirectMessagesTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <MyStadiumsTab />;
    }
  };

  const navItems = [
    { id: 'stadiums', label: 'Quản Lý Sân', icon: FiHome },
    { id: 'bookings', label: 'Quản Lý Đặt Sân', icon: FiCheckSquare },
    { id: 'timeline', label: 'Lịch Sân', icon: FiClock },
    { id: 'revenue', label: 'Doanh Thu', icon: FiBarChart2 },
    { id: 'tournaments', label: 'Giải Đấu', icon: FiAward },
    { id: 'messages', label: 'Tin Nhắn', icon: FiMessageSquare },
  ];

  const sidebar = (
    <DashboardSidebar
      brandLabel="SportifyX"
      subLabel="Owner Panel"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logout}
      userRole={user?.role}
    />
  );

  const topBar = (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.username || 'Chủ Sân'}! 🏟️</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trang chủ quản lý sân bãi và doanh thu</p>
      </div>
      <div className="relative flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 hidden sm:block"
          title={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
        <MessageBell />
        <NotificationBell />
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full pl-2 pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials(user?.username || 'OS')}
          </div>
          <div className="text-left flex flex-col">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Owner'}</strong>
            <span className="text-emerald-600 text-[10px] font-bold uppercase">{user?.role || 'StadiumOwner'}</span>
          </div>
          <FiChevronDown className="text-slate-400 ml-1" />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
            <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiUser className="text-slate-400" /> Thông tin cá nhân
            </button>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiHome className="text-slate-400" /> Trang chủ
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <FiLogOut className="text-red-400" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={sidebar} topBar={topBar}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
