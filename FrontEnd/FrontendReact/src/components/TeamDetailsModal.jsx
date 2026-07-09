import React, { useState, useEffect } from 'react';
import { FiX, FiUsers, FiAward, FiMapPin, FiShield } from 'react-icons/fi';
import { publicService } from '../services/publicService';

export default function TeamDetailsModal({ teamId, onClose }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await publicService.getTeam(teamId);
        setTeam(data);
      } catch (err) {
        console.error("Error fetching team details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="animate-pulse text-slate-500">Đang tải thông tin đội bóng...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
          <p className="text-rose-500 font-bold">Không tìm thấy thông tin đội bóng.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiShield className="text-emerald-500" />
            Chi tiết Đội bóng
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600">
              {team.teamName?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{team.teamName}</h4>
              <p className="text-slate-500 flex items-center gap-2">
                <FiMapPin /> {team.homeArea || 'Chưa cập nhật'}
              </p>
              <p className="text-slate-500 flex items-center gap-2">
                <FiAward className="text-wc-gold-500" /> Cấp độ: {team.qualityLevel || 'Phong trào'} | Ranking: {team.rankingScore || 0} | Fairplay: <span className="font-bold text-amber-500 ml-1">{team.fairplayScore ?? 100}</span>
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-3">
              <FiUsers className="text-blue-500" /> Danh sách thành viên ({team.members?.length || 0})
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {team.members?.length > 0 ? team.members.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                    {m.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{m.fullName}</p>
                    <p className="text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500">Chưa có thành viên.</p>
              )}
            </div>
          </div>
          
          {team.history && (
            <div>
              <h5 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Giới thiệu / Lịch sử</h5>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {team.history}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
