import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import playerService from '../services/playerService';
import {
  FiUsers, FiCalendar, FiAward, FiShield, FiArrowRight, FiSearch, FiChevronDown, FiUser, FiDollarSign, FiHome, FiLogOut, FiSun, FiMoon, FiMapPin, FiActivity, FiMessageSquare
} from 'react-icons/fi';
import { DashboardLayout, DashboardSidebar } from '../components/portal-ui';
import NotificationBell from '../components/NotificationBell';
import MessageBell from '../components/MessageBell';

import MatchHistoryTab from './player/MatchHistoryTab';
import PlayerRatingTab from './player/PlayerRatingTab';
import TeamActionsTab from './player/TeamActionsTab';
import PlayerPickUpTab from './player/PlayerPickUpTab';
import PlayerTeamsTab from './player/PlayerTeamsTab';
import PlayerTournamentsTab from './player/PlayerTournamentsTab';
import DirectMessagesTab from './common/DirectMessagesTab';
import ProfileTab from './common/ProfileTab';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

export default function PlayerDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'team';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyTeam();
  }, [isAuthenticated, navigate]);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      const res = await playerService.getMyTeam();
      setMyTeam(res.data);
    } catch (err) {
      console.log('No team found or error', err);
      setMyTeam(null);
    } finally {
      setLoading(false);
    }
  };

  // Removed undefined tabFromUrl usage

  const navItems = [
    { id: 'stadiums', label: 'Tìm Sân', icon: FiSearch },
    { id: 'tournaments', label: 'Giải Đấu', icon: FiAward },
    { id: 'team', label: 'Đội Của Tôi', icon: FiShield },
    { id: 'matches', label: 'Lịch Sử Thi Đấu', icon: FiCalendar },
    { id: 'community', label: 'Cộng Đồng', icon: FiUsers },
    { id: 'rankings', label: 'Bảng Xếp Hạng', icon: FiAward },
    { id: 'messages', label: 'Tin Nhắn', icon: FiMessageSquare },
  ].filter(item => {
    if (item.id === 'find-teams' && myTeam) return false;
    return true;
  });

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/player-home?tab=${id}`, { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <DashboardSidebar
      brandLabel="SportifyX"
      subLabel="Player Panel"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onLogout={handleLogout}
      userRole={user?.role}
    />
  );

  const topBar = (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Xin chào, {user?.username || 'Cầu thủ'}! ⚽</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trang chủ cầu thủ</p>

        {/* Player Stats Section */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm min-w-[120px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Tổng Số Trận</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{user?.stats?.matches || 0}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm min-w-[120px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Tỷ Lệ Thắng</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{user?.stats?.winRate || 0}%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm min-w-[120px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Xếp Hạng</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{user?.stats?.rankingScore || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative flex items-center gap-4">
        {/* Quick Info Dropdown (Funds, Next Match) */}
        <div className="hidden md:flex gap-3 mr-4">

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm text-sm flex items-center gap-2">
            <FiCalendar className="text-blue-500" />
            <div>
              <span className="text-[10px] block text-slate-400 uppercase font-bold leading-none">Trận Tới</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{myTeam?.nextMatchDate || 'Chưa có'}</span>
            </div>
          </div>
        </div>

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
            {initials(user?.username || 'PL')}
          </div>
          <div className="text-left flex flex-col">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Player'}</strong>
            <span className="text-emerald-600 text-[10px] font-bold uppercase">{user?.role || 'Player'}</span>
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
            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
            {/* Mobile Only Quick Info */}
            <div className="md:hidden px-4 py-2 space-y-2 mb-2 border-b border-slate-100 dark:border-slate-700">

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Trận tới:</span>
                <span className="font-bold text-slate-700 dark:text-white">{myTeam?.nextMatchDate || 'Chưa có'}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <FiLogOut className="text-red-400" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar} topBar={topBar}>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!myTeam && activeTab !== 'create-team' && activeTab !== 'pickup' && activeTab !== 'find-teams' && activeTab !== 'profile' && activeTab !== 'tournaments' && activeTab !== 'messages') {
    return (
      <DashboardLayout sidebar={sidebar} topBar={topBar}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700 max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiShield className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Bạn chưa có Đội thể thao</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 max-w-lg mx-auto">Hãy tham gia một đội thể thao để cùng nhau chinh phục các giải đấu, hoặc tự tạo một đội cho riêng mình!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => handleTabChange('find-teams')} className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              Tìm Đội & Xin Vào <FiArrowRight />
            </button>
            <button onClick={() => handleTabChange('create-team')} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              Tạo Đội Mới <FiUsers />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar} topBar={topBar}>
      {activeTab === 'team' && myTeam && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Đội của bạn: {myTeam.teamName} ⚽</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Nơi quản lý lịch sử thi đấu và thành viên đội thể thao.</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
        {activeTab === 'team' && myTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Overview Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-wc-navy-900 to-slate-900 dark:from-wc-navy-950 dark:to-slate-950 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group border border-slate-800">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-wc-gold-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full mb-4 flex items-center justify-center text-wc-gold-400 text-4xl font-black shadow-lg border border-white/10">
                  {myTeam.teamName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-3xl font-black mb-2">{myTeam.teamName}</h2>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-wc-gold-500/20 text-wc-gold-300 font-semibold rounded-full text-xs uppercase tracking-wider border border-wc-gold-500/30">
                    {myTeam.qualityLevel || 'Chưa cập nhật'}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-slate-300 font-semibold rounded-full text-xs uppercase tracking-wider border border-white/10">
                    {myTeam.members?.length || 0} thành viên
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  {myTeam.history || 'Chưa có thông tin giới thiệu về đội thể thao.'}
                </p>
                
                <button
                  onClick={async () => {
                    if (!window.confirm('Bạn có chắc chắn muốn rời đội không?')) return;
                    try {
                      await playerService.leaveTeam();
                      alert('Rời đội thành công!');
                      window.location.reload();
                    } catch(err) {
                      alert('Lỗi rời đội: ' + (err.response?.data?.message || err.message));
                    }
                  }}
                  className="w-full py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold rounded-xl transition-colors border border-red-500/20"
                >
                  Rời Đội Thể Thao
                </button>
              </div>
            </div>

            {/* Team Stats & Members */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Key Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:border-slate-400 font-bold uppercase mb-1">Sân Nhà</p>
                    <p className="font-bold text-slate-800 dark:text-white truncate">{myTeam.homeArea || 'Chưa rõ'}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                    <FiCalendar className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:border-slate-400 font-bold uppercase mb-1">Thành Lập</p>
                    <p className="font-bold text-slate-800 dark:text-white">{myTeam.foundedDate ? new Date(myTeam.foundedDate).toLocaleDateString('vi-VN') : '---'}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FiActivity className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Tỷ Lệ Tham Gia</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
                      {myTeam.members?.find(m => m.playerId === user?.userId || m.playerId === user?.id)?.participationRate ?? 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Member List */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FiUsers className="text-wc-gold-500" />
                  Thành Viên Đội ({myTeam.members?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myTeam.members && myTeam.members.length > 0 ? (
                    myTeam.members.map((member) => (
                      <div key={member.playerId} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
                            {initials(member.playerName)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-800 dark:text-white">{member.playerName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Từ: {new Date(member.joinedDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                        {member.roleInTeam === 'Captain' && (
                          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center" title="Đội trưởng">
                            <FiAward className="text-xs" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 col-span-full text-center py-8">Chưa có thông tin thành viên.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'create-team' && <TeamActionsTab />}
        {activeTab === 'find-teams' && <PlayerTeamsTab />}
        {activeTab === 'tournaments' && <PlayerTournamentsTab />}
        {activeTab === 'matches' && <MatchHistoryTab />}
        {activeTab === 'rating' && <PlayerRatingTab />}
        {activeTab === 'pickup' && <PlayerPickUpTab />}
        {activeTab === 'messages' && <DirectMessagesTab />}
      </div>
    </DashboardLayout>
  );
}
