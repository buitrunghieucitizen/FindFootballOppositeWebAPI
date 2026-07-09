import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiLogOut, FiMenu, FiCheckSquare, FiChevronDown, FiDollarSign, FiBarChart2, FiAward, FiUser, FiSun, FiMoon, FiClock, FiInfo, FiMessageSquare, FiSettings, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import MyStadiumsTab from './owner/MyStadiumsTab';
import BookingManagementTab from './owner/BookingManagementTab';
import OwnerRevenueTab from './owner/OwnerRevenueTab';
import OwnerTimelineTab from './owner/OwnerTimelineTab';
import OwnerTournamentsTab from './owner/OwnerTournamentsTab';
import OwnerOverviewTab from './owner/OwnerOverviewTab';
import DirectMessagesTab from './common/DirectMessagesTab';
import ProfileTab from './common/ProfileTab';
import { DashboardLayout, DashboardSidebar } from '../components/portal-ui';

import NotificationBell from '../components/NotificationBell';
import MessageBell from '../components/MessageBell';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

export default function StadiumOwnerDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OwnerOverviewTab />;
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
        return <OwnerOverviewTab />;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: FiHome },
    { id: 'stadiums', label: 'Quản Lý Sân', icon: FiMapPin },
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-4 md:mb-8 w-full">
      <div className="w-full md:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.username || 'Chủ Sân'}! 🏟️</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trang chủ quản lý sân bãi và doanh thu</p>
      </div>
      <div className="relative flex items-center justify-between md:justify-end gap-2 sm:gap-4 w-full md:w-auto">

        <MessageBell />
        <NotificationBell />
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 rounded-full pl-2 pr-3 sm:pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-wc-gold-500 to-wc-gold-600 text-wc-navy-950 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm">
            {initials(user?.username || 'OS')}
          </div>
          <div className="text-left flex flex-col hidden sm:flex">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Owner'}</strong>
            <span className="text-wc-gold-600 dark:text-wc-gold-400 text-[10px] font-bold uppercase">{user?.role || 'StadiumOwner'}</span>
          </div>
          <FiChevronDown className="text-slate-400 ml-0.5 sm:ml-1" />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-wc-navy-800 rounded-xl shadow-lg border border-slate-200 dark:border-wc-navy-700 py-2 z-50 animate-fade-in">
            <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
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
      <div className="bg-white dark:bg-wc-navy-900/80 border border-slate-200 dark:border-wc-navy-800/60 rounded-2xl p-6 shadow-sm min-h-[400px]">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
