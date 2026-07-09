import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiCalendar, FiAward, FiStar, FiEdit2, FiCamera } from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { paymentService } from '../../services/paymentService';
import { publicService } from '../../services/publicService';
import { mediaService } from '../../services/mediaService';
import Swal from 'sweetalert2';

export default function OverviewTab() {
  const [team, setTeam] = useState(null);
  const [teamRank, setTeamRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Edit state was extracted to EditTeam_Captain.jsx

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [teamData, rankingsData] = await Promise.all([
          captainService.getMyTeam(),
          publicService.getTeamRankings()
        ]);
        
        setTeam(teamData);
        
        if (teamData && rankingsData) {
          const rank = rankingsData.findIndex(r => r.id === (teamData.teamId || teamData.id));
          if (rank !== -1) {
            setTeamRank(rank + 1);
          }
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        setTeam({
          teamId: 'mock-1',
          teamName: 'FC Thống Nhất',
          rankingScore: 1000,
          homeArea: 'Quận 1, TP.HCM',
          description: 'Đội bóng phong trào tham gia các giải sân 7.',
          logoUrl: 'https://placehold.co/100x100/059669/FFFFFF?text=FCTN'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleUpgrade = async () => {
    try {
      const data = await paymentService.createPaymentLink({ type: 'TeamUpgrade', teamId: team?.teamId });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Có lỗi xảy ra khi tạo link thanh toán (Mô phỏng thành công!)');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến PayOS. Nếu bạn chưa config API Key, hãy giả lập thành công trên Backend.');
    }
  };

  const handleEditClick = () => {
    navigate('/captain/team/edit');
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Đang tải...</div>;
  }

  return (
    <div className="animate-fade-in">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Team Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <FiTarget className="text-emerald-500" /> Đội thể thao của bạn
            </h3>
            {team && (
              <div className="flex gap-2">
                <button 
                  onClick={handleEditClick}
                  className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <FiEdit2 /> Chỉnh sửa
                </button>
                <button 
                  onClick={handleUpgrade}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                >
                  <FiStar /> Nâng cấp
                </button>
              </div>
            )}
          </div>
          {team ? (
            <div className="flex gap-4 items-start">
              {team.logoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-100 shadow-sm">
                  <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2 text-sm flex-1 text-slate-900 dark:text-slate-100">
                <p><strong className="text-black dark:text-white">Tên đội:</strong> {team.teamName}</p>
                <p>
                  <strong className="text-black dark:text-white">Điểm Ranking:</strong> {team.rankingScore ?? 0} điểm
                  {teamRank && <span className="ml-2 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full text-xs">Thứ hạng: #{teamRank}</span>}
                </p>
                <p><strong className="text-black dark:text-white">Khu vực:</strong> {team.homeArea || 'Chưa cập nhật'}</p>
                <p><strong className="text-black dark:text-white">Mô tả:</strong> {team.description || team.history || 'Chưa có mô tả'}</p>
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-emerald-100/50">
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md"><FiAward /> Fairplay</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md"><FiStar /> Uy Tín</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa tạo hoặc tham gia đội thể thao nào với tư cách đội trưởng.</p>
          )}
        </div>

        {/* Upcoming Matches Empty State */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/40 dark:to-emerald-900/40 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
            <FiCalendar className="text-blue-500" /> Trận Đấu Sắp Tới
          </h3>
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/50 rounded-xl border border-blue-50">
            <FiCalendar className="text-3xl mx-auto mb-2 text-blue-200" />
            <p className="text-sm">Chưa có trận đấu nào sắp tới</p>
          </div>
        </div>
      </div>
      {/* Modal chỉnh sửa EXTRACTED */}
    </div>
  );
}

