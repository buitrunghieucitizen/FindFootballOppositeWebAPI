import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicService } from '../../services/publicService';
import { PublicHeader } from '../../components/portal-ui';
import { FiCalendar, FiUsers, FiDollarSign, FiInfo } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournamentDetail();
  }, [id]);

  const fetchTournamentDetail = async () => {
    try {
      setLoading(true);
      const data = await publicService.getTournaments();
      const currentTournament = data.find(t => (t.id || t.tournamentId) === Number(id));
      if (currentTournament) {
        setTournament(currentTournament);
      } else {
        setError('Không tìm thấy giải đấu');
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu giải đấu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-xl font-bold text-yellow-600 animate-pulse">Đang tải...</div></div>;
  if (error || !tournament) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans"><PublicHeader /><div className="p-20 text-center text-red-500 font-bold">{error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      <PublicHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 animate-fade-in">
        <Link to="/tournaments" className="text-yellow-600 hover:text-yellow-700 font-semibold mb-6 inline-block">
          &larr; Quay lại danh sách giải đấu
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-yellow-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-yellow-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <FaTrophy className="text-5xl text-yellow-400" />
              </div>
              <div className="text-center md:text-left flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-3">
                  {tournament.format || 'League'}
                </span>
                <h1 className="text-3xl md:text-5xl font-black mb-2">{tournament.name || tournament.tournamentName}</h1>
                <p className="text-yellow-200 text-lg opacity-90">{tournament.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Thông tin giải đấu</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400"><FiCalendar size={20} /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái</p>
                        <p className="font-bold text-slate-800 dark:text-white">{tournament.status === 'Upcoming' ? 'Sắp diễn ra' : tournament.status === 'Ongoing' ? 'Đang đá' : 'Đã kết thúc'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400"><FiUsers size={20} /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đội tham gia</p>
                        <p className="font-bold text-slate-800 dark:text-white">Đang mở đăng ký</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2"><FiInfo className="text-yellow-500" /> Bảng Xếp Hạng / Lịch Thi Đấu</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
                    <FaTrophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Lịch thi đấu sẽ được công bố khi giải đấu bắt đầu.</p>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Lệ phí giải</h4>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    Miễn phí
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Dành cho các đội bóng được mời tham gia.</p>
                  <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
                    Đăng Ký Tham Gia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
