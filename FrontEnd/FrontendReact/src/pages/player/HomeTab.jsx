import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';

export default function HomeTab() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyTeam();
  }, []);

  const loadMyTeam = async () => {
    try {
      setLoading(true);
      const res = await playerService.getMyTeam();
      setTeam(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setTeam(null);
      } else {
        setError('Không thể tải thông tin đội thể thao. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-4 text-rose-500">{error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tổng Quan</h2>
      {team ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-600 mb-2">Đội thể thao của bạn: {team.teamName || team.name}</h3>
          <p className="text-slate-600">Trình độ: <span className="font-semibold text-slate-800 dark:text-white">{team.qualityLevel || 'Chưa cập nhật'}</span></p>
          <p className="text-slate-600">Khu vực: <span className="font-semibold text-slate-800 dark:text-white">{team.homeArea || 'Chưa cập nhật'}</span></p>
          {/* add more details as needed */}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-300">Bạn chưa tham gia đội thể thao nào.</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Vào mục Quản Lý Đội để tạo đội mới hoặc tìm đội để gia nhập!</p>
        </div>
      )}
    </div>
  );
}
