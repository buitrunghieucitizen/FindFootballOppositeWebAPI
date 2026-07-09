import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { FiArrowLeft, FiMapPin, FiCalendar, FiUser, FiTarget, FiShield, FiAward } from 'react-icons/fi';

export default function TeamDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const res = await publicService.getTeam(id);
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin đội bóng.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !data || (!data.team && !data.teamId)) {
    return (
      <div className="min-h-screen bg-wc-navy-950 p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-rose-500 mb-4">{error || 'Không tìm thấy đội bóng'}</h2>
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-wc-navy-800 text-slate-300 hover:text-white border border-wc-navy-700 transition-colors"
        >
          <FiArrowLeft /> Quay lại
        </button>
      </div>
    );
  }

  const team = data.team || data;
  const stats = data.stats || { totalMatches: 0, wonMatches: 0, drawMatches: 0, lostMatches: 0, winRate: 0 };
  const matchHistory = data.matchHistory || [];

  // Find captain
  const captain = team.members ? team.members.find(m => m.role === 'Captain') : null;
  const captainName = captain ? (captain.fullName || captain.FullName || captain.playerName) : (team.captainName || 'Chưa cập nhật');
  const fairplayScore = (team.fairplayScore === 0 || !team.fairplayScore) ? 100 : team.fairplayScore;

  return (
    <div className="min-h-screen bg-wc-navy-950 font-sans pb-16">
      
      {/* Top Header Background */}
      <div className="bg-wc-navy-900 pt-8 pb-20 px-4 sm:px-6 lg:px-8 border-b border-wc-navy-800">
        <div className="max-w-6xl mx-auto">
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-wc-navy-800/50 hover:bg-wc-navy-800 text-slate-300 hover:text-white border border-wc-navy-700 transition-all duration-200 text-sm font-medium mb-8"
          >
            <FiArrowLeft size={16} />
            Quay lại
          </button>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-wc-navy-800 border border-wc-navy-700 shadow-xl flex items-center justify-center shrink-0 overflow-hidden">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.teamName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-amber-500">
                  {team.teamName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-wc-navy-800 text-slate-300 border border-wc-navy-700 mb-3 uppercase tracking-wider">
                {team.sportName || 'Bóng đá'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{team.teamName}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-slate-300 text-sm font-medium">
                <span className="flex items-center gap-2"><FiUser className="text-slate-400" /> Đội trưởng: <span className="text-white">{captainName}</span></span>
                <span className="flex items-center gap-2"><FiMapPin className="text-slate-400" /> Khu vực: <span className="text-white">{team.homeArea || 'Chưa cập nhật'}</span></span>
                {team.createdAt && <span className="flex items-center gap-2"><FiCalendar className="text-slate-400" /> Thành lập: <span className="text-white">{new Date(team.createdAt).getFullYear()}</span></span>}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Stats Cards Row (Overlapping the header) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-12 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Ranking */}
          <div className="bg-wc-navy-900 rounded-2xl p-6 shadow-lg border border-wc-navy-800/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <FiTarget size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium mb-1">Điểm Ranking</p>
                <p className="text-2xl font-bold text-white leading-none">{team.rankingScore || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Fairplay */}
          <div className="bg-wc-navy-900 rounded-2xl p-6 shadow-lg border border-wc-navy-800/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <FiShield size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium mb-1">Fairplay</p>
                <p className="text-2xl font-bold text-white leading-none">{fairplayScore}</p>
              </div>
            </div>
          </div>
          
          {/* Win Rate */}
          <div className="bg-wc-navy-900 rounded-2xl p-6 shadow-lg border border-wc-navy-800/50 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                <FiAward size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-medium mb-1">Tỉ lệ thắng</p>
                <p className="text-2xl font-bold text-white leading-none">{stats.winRate || 0}%</p>
              </div>
            </div>
          </div>
          
          {/* Total Matches */}
          <div className="bg-wc-navy-900 rounded-2xl p-6 shadow-lg border border-wc-navy-800/50 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-slate-400 font-medium mb-1">Tổng số trận</p>
            <p className="text-2xl font-bold text-white mb-2 leading-none">{stats.totalMatches || 0}</p>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="text-emerald-500">{stats.wonMatches || 0}T</span>
              <span className="text-slate-400">{stats.drawMatches || 0}H</span>
              <span className="text-rose-500">{stats.lostMatches || 0}B</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Match History */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Lịch sử trận đấu</h2>
            
            {matchHistory && matchHistory.length > 0 ? (
              <div className="space-y-4">
                {matchHistory.map((m, idx) => (
                  <div key={idx} className="bg-wc-navy-900 rounded-2xl p-5 border border-wc-navy-800/50 hover:border-wc-navy-700 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      
                      <div className="flex-1 text-right">
                        <span className={`font-bold text-sm sm:text-base ${m.homeTeamName === team.teamName ? 'text-amber-500' : 'text-slate-300'}`}>
                          {m.homeTeamName || 'Đội bạn'}
                        </span>
                      </div>
                      
                      <div className="px-4 text-center shrink-0">
                        <div className="text-2xl font-bold text-white tracking-widest mb-1">
                          {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : 'Không rõ'}
                        </div>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <span className={`font-bold text-sm sm:text-base ${m.awayTeamName === team.teamName ? 'text-amber-500' : 'text-slate-300'}`}>
                          {m.awayTeamName || 'Đội bạn'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-wc-navy-900 rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 border border-wc-navy-800/50 shadow-sm">
                <FiTarget className="w-12 h-12 mb-4 text-slate-600" />
                <p className="text-sm font-medium">Đội chưa có lịch sử trận đấu nào.</p>
              </div>
            )}
            
            {/* Description Section if any */}
            {(team.description || team.history) && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-6">Giới thiệu</h2>
                <div className="bg-wc-navy-900 rounded-2xl p-6 border border-wc-navy-800/50 shadow-sm text-slate-300 text-sm leading-relaxed">
                  {team.description || team.history}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Members */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-6">Thành viên ({team.members?.length || 0})</h2>
            
            <div className="bg-wc-navy-900 rounded-2xl p-2 border border-wc-navy-800/50 shadow-sm">
              {(team.members && team.members.length > 0) ? (
                <div className="flex flex-col">
                  {team.members.map((member, idx) => {
                    const name = member.fullName || member.FullName || member.playerName || 'Thành viên';
                    return (
                      <div key={idx} className="flex items-center gap-4 p-3 border-b border-wc-navy-800/50 last:border-0 hover:bg-wc-navy-800 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-wc-navy-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-bold text-white text-sm truncate">{name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{member.role === 'Captain' ? 'Đội trưởng' : 'Thành viên'}</p>
                        </div>
                        {member.role === 'Captain' && (
                          <div className="shrink-0 text-amber-500 pr-2">
                            <FiAward size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Chưa có thông tin thành viên
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
