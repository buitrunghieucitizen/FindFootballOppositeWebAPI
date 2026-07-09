import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';
import { FiUsers, FiMapPin, FiStar, FiShield } from 'react-icons/fi';

export default function MyTeamsListTab({ setActiveTab }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyTeams();
  }, []);

  const loadMyTeams = async () => {
    try {
      setLoading(true);
      const res = await playerService.getMyTeams();
      setTeams(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách đội.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Các Đội Đã Tham Gia</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Danh sách tất cả các đội bóng mà bạn đang là thành viên.</p>
        </div>
        <button 
          onClick={() => setActiveTab('team')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
        >
          Quay lại Đội chính
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl">{error}</div>
      )}

      {teams.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700">
          <FiUsers className="mx-auto text-4xl text-slate-400 mb-4" />
          <p className="text-slate-500">Bạn chưa tham gia đội nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(t => (
            <div key={t.teamId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
                  {t.teamName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t.teamName}</h3>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">{t.sportName || 'Thể thao'}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2"><FiMapPin /> {t.homeArea || 'Chưa cập nhật'}</div>
                <div className="flex items-center gap-2"><FiStar /> Trình độ: {t.qualityLevel || 'Chưa rõ'}</div>
                <div className="flex items-center gap-2"><FiShield /> Vai trò: {t.roleInTeam === 'Captain' ? 'Đội trưởng' : 'Thành viên'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
