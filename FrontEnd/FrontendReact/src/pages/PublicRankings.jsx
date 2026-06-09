import React, { useState, useEffect } from 'react';
import { publicService } from '../services/publicService';
import { FiTrendingUp, FiMapPin, FiAward } from 'react-icons/fi';
import { PublicHeader } from '../components/portal-ui';

export default function PublicRankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sportId, setSportId] = useState(1);

  useEffect(() => {
    fetchRankings(sportId);
  }, [sportId]);

  const fetchRankings = async (sId) => {
    try {
      setLoading(true);
      const data = await publicService.getTeamRankings(sId);
      setRankings(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <PublicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <FiTrendingUp className="text-emerald-600" /> Bảng Xếp Hạng Đội Thể Thao
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Top những đội có điểm số và thành tích tốt nhất trên hệ thống.
          </p>
          <div className="mt-6 flex justify-center">
            <select
              value={sportId}
              onChange={(e) => setSportId(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
            >
              <option value={1}>Bóng đá</option>
              <option value={2}>Cầu lông</option>
              <option value={3}>Pickleball</option>
              <option value={4}>Khác</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-emerald-600 animate-pulse font-bold text-xl">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl max-w-2xl mx-auto">{error}</div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-emerald-900/5 border border-slate-100 dark:border-slate-700/50 overflow-hidden max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xếp hạng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Đội Thể Thao</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Môn</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khu Vực</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {rankings.map((team, index) => (
                    <tr key={team.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-5 px-6 text-center">
                        {index === 0 ? <FiAward className="mx-auto text-yellow-500 w-8 h-8" /> :
                         index === 1 ? <FiAward className="mx-auto text-slate-400 w-8 h-8" /> :
                         index === 2 ? <FiAward className="mx-auto text-amber-600 w-8 h-8" /> :
                         <span className="font-bold text-slate-400 text-lg">{index + 1}</span>}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg border border-emerald-200">
                            {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{team.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-medium">
                          {team.sportName || 'Đang cập nhật'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {team.homeArea || 'Đang cập nhật'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center font-bold text-emerald-600 text-2xl">
                        {team.rankingScore}
                      </td>
                    </tr>
                  ))}
                  {rankings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu xếp hạng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

