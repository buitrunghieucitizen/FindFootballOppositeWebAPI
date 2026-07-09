import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userProfileService } from '../../services/userProfileService';
import playerService from '../../services/playerService';
import {
  FiCalendar, FiAward, FiShield, FiUser, FiArrowRight, FiPlay, FiUsers, FiClock, FiMapPin
} from 'react-icons/fi';

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

export default function PlayerOverviewTab({ setActiveTab }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, matchesRes] = await Promise.all([
        userProfileService.getProfile().catch(() => null),
        playerService.getMatches().catch(() => ({ data: [] }))
      ]);
      setProfile(profileData);
      
      const allMatches = matchesRes.data || [];
      // Get the 3 most recent matches
      setRecentMatches(allMatches.slice(0, 3));
    } catch (err) {
      console.error("Error loading overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      {/* ─── HERO PROFILE ─── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
        <div className="h-40 sm:h-56 bg-slate-200 dark:bg-slate-700 relative">
          {profile?.backgroundUrl ? (
            <img src={profile.backgroundUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-xl shrink-0 z-10 relative">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-4xl shadow-inner overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile?.fullName || user?.username)
                )}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1 pb-2">
              <h1 className="font-sport text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                {profile?.fullName || user?.username || 'Cầu Thủ'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                @{profile?.username || user?.username} • Tham gia từ {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : new Date().getFullYear()}
              </p>
            </div>
            
            {/* Quick Actions (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pb-2 z-10">
              <button onClick={() => setActiveTab('find-teams')} className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-2">
                <FiUsers /> Tìm Đội
              </button>
              <button onClick={() => setActiveTab('pickup')} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2">
                <FiPlay /> Gạ Kèo
              </button>
            </div>
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="flex sm:hidden items-center justify-center gap-3 mt-6">
            <button onClick={() => setActiveTab('find-teams')} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 text-slate-700 dark:text-white font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 transition-colors flex items-center justify-center gap-2">
              <FiUsers /> Tìm Đội
            </button>
            <button onClick={() => setActiveTab('pickup')} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
              <FiPlay /> Gạ Kèo
            </button>
          </div>
        </div>
      </div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4">
            <FiCalendar className="text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Số Trận Đã Đấu</p>
          <h3 className="font-sport text-4xl font-bold text-slate-900 dark:text-white">{user?.stats?.matches || 0}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-4">
            <FiAward className="text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tỷ Lệ Thắng</p>
          <h3 className="font-sport text-4xl font-bold text-slate-900 dark:text-white">{user?.stats?.winRate || 0}%</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-4">
            <FiShield className="text-xl" />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Xếp Hạng</p>
          <h3 className="font-sport text-4xl font-bold text-slate-900 dark:text-white">{user?.stats?.rankingScore || 0}</h3>
        </div>
        
        <div className="bg-gradient-to-br from-wc-navy-900 to-slate-900 dark:from-wc-navy-950 dark:to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-center text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('team')}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-wc-gold-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-12 h-12 rounded-xl bg-white/10 text-wc-gold-400 flex items-center justify-center mb-4 border border-white/10 backdrop-blur-sm">
            <FiUsers className="text-xl" />
          </div>
          <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Đội Thể Thao</p>
          <h3 className="text-lg font-bold text-white flex items-center justify-between">
            Quản lý đội <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </h3>
        </div>
      </div>

      {/* ─── RECENT MATCHES ─── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-sport text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">Lịch Sử Trận Đấu</h2>
          <button onClick={() => setActiveTab('matches')} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1">
            Xem tất cả <FiArrowRight />
          </button>
        </div>
        <div className="p-6">
          {recentMatches.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              Chưa có trận đấu nào. Tạo kèo giao hữu ngay!
            </div>
          ) : (
            <div className="space-y-4">
              {recentMatches.map((m, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {m.matchType || 'Giao hữu'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <FiClock /> {m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      {m.homeTeamName || 'Đội nhà'} <span className="text-slate-400 font-normal mx-1">vs</span> {m.awayTeamName || 'Đội khách'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:justify-end">
                    {m.matchStatus === 'Completed' ? (
                      <div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                        <span className="font-sport text-xl font-bold text-slate-900 dark:text-white tracking-widest">
                          {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                        </span>
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800 text-sm font-bold">
                        {m.matchStatus || 'Sắp diễn ra'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
