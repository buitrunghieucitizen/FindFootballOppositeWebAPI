import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSettings, FiUsers, FiMap, FiPlus, FiSave, FiRefreshCw, FiLogOut, FiHome, FiUser, FiChevronDown, FiSun, FiMoon, FiGrid, FiCalendar, FiMapPin, FiMessageSquare, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { captainService } from '../../services/captainService';
import { publicService } from '../../services/publicService';
import { DashboardLayout, DashboardSidebar } from '../../components/portal-ui';
import NotificationBell from '../../components/NotificationBell';
import SwissBracketMap, { DEFAULT_SWISS_8, DEFAULT_SWISS_16, generateSwissBracket } from '../../components/SwissBracketMap';
import DoubleEliminationBracket, { DEFAULT_DOUBLE_ELIM_8, generateDoubleElimination } from '../../components/DoubleEliminationBracket';
import KnockoutBracket, { DEFAULT_KNOCKOUT_8, DEFAULT_KNOCKOUT_16, generateKnockout } from '../../components/KnockoutBracket';
import GroupStageMap, { DEFAULT_GROUP_STAGE, generateGroupStage } from '../../components/GroupStageMap';
import LeagueMap, { DEFAULT_LEAGUE, generateRoundRobin } from '../../components/LeagueMap';
import TournamentMatchesList from '../../components/TournamentMatchesList';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ManageTournament_Captain() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [showSwissSettings, setShowSwissSettings] = useState(false);

  // States for Settings Tab
  const [settings, setSettings] = useState({
    name: 'Giải Đấu Chưa Đặt Tên',
    sport: 'Bóng đá',
    stadium: '',
    format: 'Swiss',
    scope: 'Internal',
    maxTeams: 16,
  });

  // States for Add Team Modal
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [addTeamForm, setAddTeamForm] = useState({ name: '', abbr: '', isNew: true, selectedTeamId: '' });
  const [systemTeams, setSystemTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState('');

  // States for Teams Tab
  const [teams, setTeams] = useState([]);
  const [numInternalTeams, setNumInternalTeams] = useState(4);

  // States for Bracket Tab (Swiss)
  const [bracket, setBracket] = useState({ rounds: [] });

  useEffect(() => {
    const init = async () => {
      try {
        const allTournaments = await captainService.getTournaments();
        const current = allTournaments.find(t => (t.id || t.tournamentId) == id);
        if (current) {
          if (current.approvalStatus !== 'Approved') {
            alert('Giải đấu này chưa được duyệt. Bạn chưa thể quản lý!');
            navigate('/captain');
            return;
          }
          if (current.entryFee > 0 && !current.isFeePaid) {
            alert('Giải đấu này chưa thanh toán lệ phí. Bạn chưa thể quản lý!');
            navigate('/captain');
            return;
          }
          setTournament(current);
        } else {
           alert('Không tìm thấy giải đấu');
           navigate('/captain');
           return;
        }
      } catch (e) {
        console.warn("Lỗi load trạng thái giải đấu", e);
      }

      loadTournamentSettings();
      loadTeams();
      loadBracket();
    };
    init();
  }, [id]);

  const loadTournamentSettings = async () => {
    try {
      const data = await captainService.getTournamentSettings(id);
      if (data) {
        setSettings(data);
      }
    } catch (e) {
      console.warn("Lỗi load settings", e);
    }
  };

  const loadTeams = async () => {
    const data = await captainService.getTournamentTeams(id);
    setTeams(data || []);
  };

  const loadBracket = async () => {
    const data = await captainService.getTournamentBracket(id);
    setBracket(data || { rounds: [] });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    await captainService.updateTournamentSettings(id, settings);
    alert('Đã cập nhật cài đặt giải đấu');
    setLoading(false);
  };

  const handleRequestRefund = async () => {
    if (confirm('Lưu ý: Hủy giải sẽ được hoàn lại 80% số tiền. Bạn có chắc chắn muốn hủy giải đấu này và yêu cầu hoàn tiền?')) {
      try {
        await captainService.requestRefund(id);
        alert('Đã gửi yêu cầu hoàn tiền thành công.');
        loadTournament();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi yêu cầu hoàn tiền');
      }
    }
  };

  const handleConfirmRefund = async () => {
    if (confirm('Bạn xác nhận đã nhận được tiền hoàn từ Admin?')) {
      try {
        await captainService.confirmRefund(id);
        alert('Đã xác nhận hoàn tiền xong.');
        loadTournament();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi xác nhận');
      }
    }
  };

  const handleGenerateInternalTeams = async () => {
    if (confirm(`Bạn muốn tự động chia thành viên hiện tại thành ${numInternalTeams} đội?`)) {
      setLoading(true);
      await captainService.generateInternalTeams(id, numInternalTeams);
      alert('Đã chia đội thành công!');
      await loadTeams();
      setLoading(false);
    }
  };

  const loadSystemTeams = async () => {
    try {
      const data = await publicService.getTeams();
      setSystemTeams(data || []);
    } catch (e) {
      console.warn("Lỗi load system teams", e);
    }
  };

  const handleOpenAddTeam = () => {
    loadSystemTeams();
    setShowAddTeamModal(true);
  };

  const handleSubmitAddTeam = async (e) => {
    e.preventDefault();
    if (addTeamForm.abbr.length < 3 || addTeamForm.abbr.length > 4) {
      alert('Tên viết tắt phải có 3-4 chữ cái!');
      return;
    }
    // Check abbreviation uniqueness in current tournament
    if (teams.some(t => t.abbr?.toUpperCase() === addTeamForm.abbr.toUpperCase())) {
      alert('Tên viết tắt này đã tồn tại trong giải đấu!');
      return;
    }

    setLoading(true);
    if (addTeamForm.isNew) {
      await captainService.addTeamToTournament(id, { name: addTeamForm.name, abbr: addTeamForm.abbr.toUpperCase() });
    } else {
      const selected = systemTeams.find(t => t.id === Number(addTeamForm.selectedTeamId));
      if(selected) {
        await captainService.addTeamToTournament(id, { teamId: selected.id, name: selected.name, abbr: addTeamForm.abbr.toUpperCase() });
      }
    }
    await loadTeams();
    setShowAddTeamModal(false);
    setAddTeamForm({ name: '', abbr: '', isNew: true, selectedTeamId: '' });
    setLoading(false);
  };

  const handleUpdateMatchScore = async (roundIndex, matchIndex, homeScore, awayScore) => {
    const newBracket = { ...bracket };
    newBracket.rounds[roundIndex].matches[matchIndex].homeScore = homeScore;
    newBracket.rounds[roundIndex].matches[matchIndex].awayScore = awayScore;
    setBracket(newBracket);
  };

  const handleSaveSwissRound = async (roundNum, matches) => {
    setLoading(true);
    await captainService.updateSwissMatches(id, roundNum, matches);
    alert('Đã lưu kết quả vòng ' + roundNum);
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: FiGrid },
    { id: 'members', label: 'Thành Viên', icon: FiUsers },
    { id: 'matches', label: 'Kèo Đấu', icon: FiCalendar },
    { id: 'tournaments', label: 'Giải Đấu', icon: FiAward },
    { id: 'stadiums', label: 'Tìm Sân', icon: FiMapPin },
    { id: 'posts', label: 'Đăng Bài', icon: FiMessageSquare },
    { id: 'rankings', label: 'Bảng xếp hạng', icon: FiTrendingUp },
    { id: 'premium', label: 'Gói Quản Lý', icon: FiAward },
  ];

  const sidebar = (
    <DashboardSidebar
      brandLabel="SportifyX"
      subLabel="Captain Panel"
      navItems={navItems}
      activeTab={'tournaments'}
      setActiveTab={(tab) => navigate(`/captain-home?tab=${tab}`)}
      onLogout={handleLogout}
      userRole={user?.role}
    />
  );

  const topBar = (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quản lý Giải Đấu 🏆</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{settings.name}</p>
      </div>
      <div className="relative flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 hidden sm:block"
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
        <NotificationBell />
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full pl-2 pr-4 py-1.5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials(user?.username || 'CP')}
          </div>
          <div className="text-left flex flex-col">
            <strong className="block text-slate-800 dark:text-white font-bold text-sm leading-tight">{user?.username || 'Captain'}</strong>
            <span className="text-emerald-600 text-[10px] font-bold uppercase">{user?.role || 'Captain'}</span>
          </div>
          <FiChevronDown className="text-slate-400 ml-1" />
        </button>
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiUser className="text-slate-400" /> Thông tin cá nhân
            </Link>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
              <FiHome className="text-slate-400" /> Trang chủ
            </Link>
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
      
      <div className="mb-8">
        <button 
          onClick={() => navigate('/captain-home')}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 font-medium"
        >
          <FiArrowLeft /> Quay lại Dashboard
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <FaTrophy /> Quản lý giải đấu
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                {settings.name}
              </h1>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FiSettings /> Cài đặt
              </button>
              <button 
                onClick={() => setActiveTab('teams')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'teams' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FiUsers /> Đội bóng
              </button>
              <button 
                onClick={() => setActiveTab('bracket')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'bracket' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FiMap /> Xếp lịch
              </button>
              <button 
                onClick={() => setActiveTab('matches_list')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'matches_list' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <FiCalendar /> Lịch thi đấu
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            
            {/* TAB SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="max-w-2xl animate-fade-in space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên giải đấu</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={e => setSettings({...settings, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Môn thể thao</label>
                    <select 
                      value={settings.sport}
                      onChange={e => setSettings({...settings, sport: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Bóng đá">Bóng đá</option>
                      <option value="Bóng rổ">Bóng rổ</option>
                      <option value="Cầu lông">Cầu lông</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Bóng chuyền">Bóng chuyền</option>
                      <option value="E-Sports">E-Sports</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân thi đấu</label>
                    <input 
                      type="text" 
                      value={settings.stadium}
                      onChange={e => setSettings({...settings, stadium: e.target.value})}
                      placeholder="VD: Sân Chảo Lửa"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số đội tham gia</label>
                    <select 
                      value={settings.maxTeams}
                      onChange={e => {
                        const newMax = Number(e.target.value);
                        const newFormat = (newMax < 8 && settings.format === 'Swiss') ? 'League' : settings.format;
                        setSettings({...settings, maxTeams: newMax, format: newFormat});
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={4}>4 Đội</option>
                      <option value={8}>8 Đội</option>
                      <option value={16}>16 Đội</option>
                      <option value={32}>32 Đội</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thể thức</label>
                    <select 
                      value={settings.format}
                      onChange={e => setSettings({...settings, format: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="League">Đá vòng tròn (League)</option>
                      <option value="Knockout">Loại trực tiếp (Single Elimination)</option>
                      <option value="DoubleElimination">Nhánh Thắng/Thua (Double Elimination)</option>
                      <option value="GroupStage">Vòng bảng (Group Stage)</option>
                      <option value="Swiss" disabled={settings.maxTeams < 8}>Hệ Thụy Sĩ (Swiss) - Yêu cầu ≥ 8 đội</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quy mô</label>
                    <select 
                      value={settings.scope}
                      onChange={e => setSettings({...settings, scope: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Internal">Giải Nội Bộ</option>
                      <option value="Public">Giải Mở Rộng</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày bắt đầu</label>
                    <input 
                      type="date"
                      value={settings.startDate ? new Date(settings.startDate).toISOString().split('T')[0] : ''}
                      onChange={e => setSettings({...settings, startDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ngày kết thúc</label>
                    <input 
                      type="date"
                      value={settings.endDate ? new Date(settings.endDate).toISOString().split('T')[0] : ''}
                      onChange={e => setSettings({...settings, endDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="pt-4 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-200 dark:border-slate-700 mt-6">
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors">
                    <FiSave /> Lưu Cài Đặt
                  </button>
                  
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-slate-500 italic">Hủy giải sẽ được hoàn lại 80% số tiền tạo giải.</p>
                    {tournament?.status === 'Cancelled' ? (
                      tournament?.refundStatus === 'Requested' ? (
                        <button type="button" disabled className="px-6 py-3 bg-slate-300 text-slate-600 font-bold rounded-xl cursor-not-allowed">
                          Đang chờ Admin hoàn tiền...
                        </button>
                      ) : tournament?.refundStatus === 'AdminRefunded' ? (
                        <button type="button" onClick={handleConfirmRefund} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                          Đã nhận tiền
                        </button>
                      ) : tournament?.refundStatus === 'Completed' ? (
                        <button type="button" disabled className="px-6 py-3 bg-slate-300 text-slate-600 font-bold rounded-xl cursor-not-allowed">
                          Đã nhận tiền hoàn
                        </button>
                      ) : null
                    ) : (
                      <button type="button" onClick={handleRequestRefund} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors">
                        Yêu cầu hoàn tiền (Hủy giải)
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* TAB TEAMS */}
            {activeTab === 'teams' && (
              <div className="animate-fade-in space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Danh sách đội ({teams.length})</h3>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {settings.scope === 'Internal' && (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <select 
                          value={numInternalTeams}
                          onChange={e => setNumInternalTeams(Number(e.target.value))}
                          className="bg-transparent border-none text-sm font-bold pl-3 pr-8 py-2 focus:ring-0 outline-none text-slate-700 dark:text-slate-300"
                        >
                          <option value={2}>Chia 2 đội</option>
                          <option value={4}>Chia 4 đội</option>
                          <option value={6}>Chia 6 đội</option>
                        </select>
                        <button 
                          onClick={handleGenerateInternalTeams}
                          disabled={loading}
                          className="bg-white dark:bg-slate-700 text-emerald-600 font-bold px-4 py-2 rounded-lg text-sm shadow-sm flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Tạo từ thành viên
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={handleOpenAddTeam}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <FiPlus /> Thêm đội vào giải
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team, idx) => (
                    <div key={team.id || idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 bg-white dark:bg-slate-800 hover:border-emerald-500 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {team.name} {team.abbr && <span className="text-slate-400 text-sm ml-2">({team.abbr})</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Trạng thái: 
                          <span className={team.status === 'Pending' ? 'text-amber-500 font-bold ml-1' : 'text-emerald-500 ml-1'}>
                            {team.status === 'Pending' ? 'Chờ duyệt' : (team.status === 'Approved' ? 'Đã duyệt' : (team.status || 'Đã duyệt'))}
                          </span>
                        </div>
                      </div>
                      {team.status === 'Pending' && (
                        <div className="flex gap-2 ml-auto">
                          <button 
                            onClick={async () => {
                              try {
                                await captainService.acceptTournamentTeam(id, team.id);
                                loadTeams();
                              } catch(e) { alert('Lỗi: ' + e.message); }
                            }}
                            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={async () => {
                              if(confirm('Bạn có chắc muốn từ chối đội này?')) {
                                try {
                                  await captainService.rejectTournamentTeam(id, team.id);
                                  loadTeams();
                                } catch(e) { alert('Lỗi: ' + e.message); }
                              }
                            }}
                            className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {teams.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">Chưa có đội nào tham gia giải đấu này.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB BRACKET */}
            {activeTab === 'bracket' && (
              <div className="animate-fade-in space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sơ Đồ Xếp Lịch</h3>
                    <p className="text-sm text-slate-500 mt-1">Cập nhật kết quả các vòng đấu theo thể thức bạn đã chọn.</p>
                  </div>
                  {settings.format?.toLowerCase() === 'swiss' && (
                    <button 
                      onClick={() => setShowSwissSettings(true)}
                      className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                    >
                      + Cài Đặt Hệ Thụy Sĩ
                    </button>
                  )}
                </div>

                {settings.format?.toLowerCase() === 'swiss' && (
                  <SwissBracketMap 
                    data={bracket.rounds?.length > 0 ? bracket : generateSwissBracket([], settings.maxTeams || 16)}
                    teams={teams.map(t => ({ id: t.id, name: t.abbr || t.name }))}
                    onMatchUpdate={(newBracket) => {
                      setBracket(newBracket);
                    }}
                  />
                )}

                {settings.format?.toLowerCase() === 'knockout' && (
                  <KnockoutBracket 
                    data={bracket.rounds?.length > 0 ? bracket : generateKnockout([], settings.maxTeams || 8)}
                    teams={teams.map(t => ({ id: t.id, name: t.abbr || t.name }))}
                    onMatchUpdate={(newBracket) => {
                      setBracket(newBracket);
                    }}
                  />
                )}

                {settings.format?.toLowerCase() === 'doubleelimination' && (
                  <DoubleEliminationBracket 
                    data={bracket.winners?.length > 0 ? bracket : generateDoubleElimination([], settings.maxTeams || 8)}
                    teams={teams.map(t => ({ id: t.id, name: t.abbr || t.name }))}
                    onMatchUpdate={(newBracket) => {
                      setBracket(newBracket);
                    }}
                  />
                )}

                {settings.format?.toLowerCase() === 'groupstage' && (
                  <GroupStageMap 
                    data={bracket.groups?.length > 0 ? bracket : generateGroupStage([], settings.maxTeams || 8)}
                    teams={teams.map(t => ({ id: t.id, name: t.abbr || t.name }))}
                    onMatchUpdate={(newBracket) => {
                      setBracket(newBracket);
                    }}
                  />
                )}

                {settings.format?.toLowerCase() === 'league' && (
                  <LeagueMap 
                    data={bracket.teams?.length > 0 ? bracket : generateRoundRobin([], settings.maxTeams || 6)}
                    onMatchUpdate={(newBracket) => {
                      setBracket(newBracket);
                    }}
                  />
                )}

                {(settings.format !== 'Swiss' && settings.format !== 'DoubleElimination' && settings.format !== 'GroupStage' && settings.format !== 'Knockout' && settings.format !== 'League') && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                    <FiMap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Chưa có giao diện demo cho thể thức {settings.format}.</p>
                    <p className="text-sm text-slate-400 mt-2">Vui lòng chọn Thụy Sĩ, Nhánh Thắng/Thua, Vòng Bảng, Đá vòng tròn hoặc Loại Trực Tiếp.</p>
                    <button onClick={() => setActiveTab('settings')} className="mt-4 text-emerald-600 font-bold hover:underline">Về trang Cài đặt</button>
                  </div>
                )}
              </div>
            )}

            {/* TAB MATCHES LIST */}
            {activeTab === 'matches_list' && (
              <TournamentMatchesList tournamentId={id} service={captainService} />
            )}

          </div>
        </div>
      </div>

      {/* SWISS SETTINGS MODAL */}
      {showSwissSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Cài Đặt Hệ Thụy Sĩ</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Bạn có thể làm mới lại cấu trúc nhánh đấu. Lưu ý việc này sẽ xóa các điểm số hiện tại trên sơ đồ nhánh.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => {
                  if(confirm('Bạn có chắc chắn muốn reset lại toàn bộ sơ đồ nhánh?')) {
                    setBracket(DEFAULT_SWISS_8);
                    setSettings({...settings, maxTeams: 8});
                    alert('Đã tạo sơ đồ Thụy Sĩ 8 đội!');
                    setShowSwissSettings(false);
                  }
                }}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white">Tạo sơ đồ 8 Đội</div>
                <div className="text-xs text-slate-500">3 vòng đấu (Kết thúc ở 2 thắng hoặc 2 thua)</div>
              </button>
              
              <button 
                onClick={() => {
                  if(confirm('Bạn có chắc chắn muốn reset lại toàn bộ sơ đồ nhánh?')) {
                    setBracket(DEFAULT_SWISS_16);
                    setSettings({...settings, maxTeams: 16});
                    alert('Đã tạo sơ đồ Thụy Sĩ 16 đội!');
                    setShowSwissSettings(false);
                  }
                }}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <div className="font-bold text-slate-900 dark:text-white">Tạo sơ đồ 16 Đội</div>
                <div className="text-xs text-slate-500">5 vòng đấu (Kết thúc ở 3 thắng hoặc 3 thua)</div>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSwissSettings(false)}
                className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEAM MODAL */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl animate-fade-in overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Thêm đội vào giải</h3>
            </div>
            
            <form onSubmit={handleSubmitAddTeam} className="p-6 space-y-6">
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAddTeamForm({ ...addTeamForm, isNew: true })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${addTeamForm.isNew ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Tạo đội tạm
                </button>
                <button
                  type="button"
                  onClick={() => setAddTeamForm({ ...addTeamForm, isNew: false })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${!addTeamForm.isNew ? 'bg-white dark:bg-slate-600 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Chọn từ hệ thống
                </button>
              </div>

              {!addTeamForm.isNew ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tìm kiếm đội hệ thống</label>
                  <input
                    type="text"
                    placeholder="Nhập tên đội..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    required
                    value={addTeamForm.selectedTeamId}
                    onChange={(e) => {
                      const sel = systemTeams.find(t => t.id === Number(e.target.value));
                      setAddTeamForm({ ...addTeamForm, selectedTeamId: e.target.value, name: sel?.name || '', abbr: sel?.abbr || '' });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    size="4"
                  >
                    <option value="" disabled>-- Chọn đội --</option>
                    {systemTeams
                      .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Đội trưởng: {t.captainId ? 'Đã có' : 'Chưa có'})</option>
                      ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên đội mới</label>
                  <input 
                    type="text" 
                    required
                    value={addTeamForm.name}
                    onChange={e => setAddTeamForm({ ...addTeamForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="VD: FC Rồng Xanh"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tên viết tắt (Abbreviation)</label>
                <input 
                  type="text" 
                  required
                  minLength={3}
                  maxLength={4}
                  value={addTeamForm.abbr}
                  onChange={e => setAddTeamForm({ ...addTeamForm, abbr: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                  placeholder="VD: RXF (3-4 chữ cái)"
                />
                <p className="text-xs text-slate-500 mt-2">Dùng để hiển thị thu gọn trên sơ đồ thi đấu và bảng xếp hạng.</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Thêm đội
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
