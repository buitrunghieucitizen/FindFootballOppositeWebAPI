import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';
import { FiMapPin, FiSearch, FiShield } from 'react-icons/fi';

export default function AreaBrowserTab() {
  const [ward, setWard] = useState('Quận 1');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearbyTeams = async (searchWard) => {
    try {
      setLoading(true);
      const res = await playerService.getNearbyTeams({ ward: searchWard });
      setTeams(res.data || []);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu các đội xung quanh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyTeams(ward);
  }, []); // Initial load

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNearbyTeams(ward);
  };

  const handleJoinRequest = async (teamId) => {
    try {
      await playerService.requestJoin(teamId);
      alert('Đã gửi yêu cầu gia nhập!');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FiMapPin className="text-slate-900 dark:text-white" />
          Tìm Đội Xung Quanh
        </h2>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            placeholder="Nhập khu vực (VD: Quận 1, Gò Vấp...)"
            value={ward}
            onChange={e => setWard(e.target.value)}
          />
        </div>
        <button type="submit" className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors">
          Tìm Kiếm
        </button>
      </form>

      {loading ? (
        <div className="text-slate-500 dark:text-slate-400 py-8">Đang tìm kiếm...</div>
      ) : error ? (
        <div className="text-rose-500 py-8">{error}</div>
      ) : teams.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center text-slate-500 dark:text-slate-400">
          Không tìm thấy đội nào ở khu vực này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(t => (
            <div key={t.teamId} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50 flex items-center justify-center text-slate-800 dark:text-white">
                  <FiShield size={24} />
                </div>
                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 dark:text-slate-300 rounded text-xs font-medium">
                  {t.qualityLevel || 'Chưa rõ'}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{t.teamName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <FiMapPin className="shrink-0" /> {t.homeArea || 'Chưa cập nhật'}
              </p>
              <button onClick={() => handleJoinRequest(t.teamId)} className="w-full py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 dark:text-white font-medium rounded-xl transition-colors">
                Xin Gia Nhập
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
