import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { PublicHeader } from '../../components/portal-ui';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiAward, FiMessageCircle } from 'react-icons/fi';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Tạm thời fetch data từ danh sách public matches rồi filter
    // Tương lai cần API getMatchById
    fetchMatchDetail();
  }, [id]);

  const fetchMatchDetail = async () => {
    try {
      setLoading(true);
      const data = await publicService.getMatches();
      const currentMatch = data.find(m => m.matchId === Number(id));
      if (currentMatch) {
        setMatch(currentMatch);
      } else {
        setError('Không tìm thấy trận đấu');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu trận đấu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-xl font-bold text-emerald-600 animate-pulse">Đang tải...</div></div>;
  if (error || !match) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-red-500 font-bold">{error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      <PublicHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 animate-fade-in">
        <Link to="/matches" className="text-emerald-600 hover:text-emerald-700 font-semibold mb-6 inline-block">
          &larr; Quay lại danh sách
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-teal-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-sm font-bold tracking-widest uppercase mb-4 relative z-10">
              {match.matchType || 'Giao Hữu'}
            </span>
            <div className="flex justify-center items-center gap-4 sm:gap-8 relative z-10">
              <div className="text-right flex-1">
                <h3 className="text-2xl sm:text-4xl font-black">{match.homeTeamName || 'Đội nhà'}</h3>
              </div>
              <div className="text-center shrink-0">
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl px-6 py-4 border border-slate-700">
                  <span className="text-3xl sm:text-5xl font-black tracking-widest">
                    {match.matchStatus === 'Completed' ? `${match.homeScore || 0} - ${match.awayScore || 0}` : 'VS'}
                  </span>
                </div>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-2xl sm:text-4xl font-black">{match.awayTeamName || 'Đang chờ...'}</h3>
              </div>
            </div>
            <div className="mt-6 inline-block px-4 py-1.5 rounded-full bg-white text-slate-900 text-sm font-bold uppercase relative z-10">
              {match.matchStatus === 'Cancelled' ? 'Đã Hủy' : match.matchStatus === 'Completed' ? 'Đã Kết Thúc' : 'Sắp Diễn Ra'}
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin trận đấu</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Thời gian</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.kickoffLabel || 'Chưa xếp lịch'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FiMapPin />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sân vận động</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.venueLabel || 'Chưa chốt sân'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FiAward />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Trạng thái sân</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.bookingSummary || 'Chưa rõ'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin bên lề</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <FiUsers />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tình hình lực lượng</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.attendanceSummary || 'Chưa có thông tin điểm danh'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <FiMessageCircle />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Quy định hủy kèo</p>
                    <p className="font-bold text-slate-800 dark:text-white">{match.cancelFlowSummary || 'Tuân thủ quy định hệ thống'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional details could go here like Timeline, Events, etc. */}
            <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tính năng Bình luận trận đấu và Tường thuật trực tiếp đang được phát triển.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
