import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import stadiumOwnerService from '../../services/stadiumOwnerService';
import { FiPlus, FiCalendar, FiUsers, FiSettings, FiX } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

export default function OwnerTournamentsTab() {
  const [tournaments, setTournaments] = useState([]);
  const [myStadiums, setMyStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Modal state was extracted to CreateTournament_Owner.jsx
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournRes, stadiumRes] = await Promise.all([
        stadiumOwnerService.getTournaments().catch(() => ({ data: [] })),
        stadiumOwnerService.getMyStadiums().catch(() => ({ data: [] }))
      ]);
      setTournaments(tournRes.data || []);
      setMyStadiums(stadiumRes.data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách giải đấu');
    } finally {
      setLoading(false);
    }
  };

  // Handlers extracted to CreateTournament_Owner.jsx

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FaTrophy className="text-emerald-500" /> Quản lý Giải Đấu
        </h2>
        <button 
          onClick={() => navigate('/owner/tournaments/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-wc-gold-500/25 font-bold hover:shadow-xl hover:-translate-y-0.5"
        >
          <FiPlus /> Tạo Giải Mới
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>
      ) : tournaments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <FaTrophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn chưa tổ chức giải đấu nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => (
            <div key={t.id || t.tournamentId} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.approvalStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  t.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                  (!t.isFeePaid && t.platformFee > 0) ? 'bg-blue-100 text-blue-700' :
                  t.status === 'Upcoming' ? 'bg-emerald-100 text-emerald-700' :
                  t.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {t.approvalStatus === 'Pending' ? 'Chờ Duyệt' :
                   t.approvalStatus === 'Rejected' ? 'Từ chối' :
                   (!t.isFeePaid && t.platformFee > 0) ? 'Chờ Thanh Toán' :
                   t.status === 'Upcoming' ? 'Sắp diễn ra' : 
                   t.status === 'Ongoing' ? 'Đang đá' : t.status || 'Khởi tạo'}
                </span>
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  {t.format === 'League' ? 'Đá vòng tròn' :
                   t.format === 'Knockout' ? 'Loại trực tiếp' :
                   t.format === 'DoubleElimination' ? 'Nhánh Thắng/Thua' :
                   t.format === 'GroupStage' ? 'Vòng bảng' :
                   t.format === 'Swiss' ? 'Hệ Thụy Sĩ' : t.format}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{t.name || t.tournamentName}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiCalendar className="mr-2 text-slate-400" />
                  Thời gian: {t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'} {t.endDate ? ` - ${new Date(t.endDate).toLocaleDateString('vi-VN')}` : ''}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiUsers className="mr-2 text-slate-400" />
                  Số đội: {Array.isArray(t.teams) ? t.teams.length : (t.teams || 0)}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <FiCalendar className="mr-2 text-slate-400" />
                  Lệ phí tạo giải: {(t.platformFee || 0).toLocaleString()} VNĐ
                </div>
              </div>
              
              {!t.isFeePaid && t.platformFee > 0 && t.approvalStatus === 'Approved' ? (
                <button 
                  onClick={async () => {
                    try {
                      const { paymentService } = await import('../../services/paymentService');
                      const data = await paymentService.createPaymentLink({ Type: 'TournamentFee', TournamentId: t.id || t.tournamentId });
                      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                      else alert(data.message || 'Có lỗi xảy ra');
                    } catch (e) {
                      alert('Lỗi: ' + (e.response?.data?.message || e.message));
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow hover:shadow-lg transition-all"
                >
                  Thanh Toán PayOS
                </button>
              ) : (
                <button 
                  onClick={() => navigate(`/owner/tournaments/${t.id || t.tournamentId}/manage`)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
                  disabled={t.approvalStatus === 'Pending' || t.approvalStatus === 'Rejected'}
                >
                  {t.approvalStatus === 'Pending' ? 'Đang chờ duyệt...' : t.approvalStatus === 'Rejected' ? 'Bị từ chối' : 'Quản lý giải'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO GIẢI ĐẤU EXTRACTED TO SEPARATE PAGE */}
    </div>
  );
}
