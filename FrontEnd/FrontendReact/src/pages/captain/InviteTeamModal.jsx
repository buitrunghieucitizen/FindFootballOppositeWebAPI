import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiCheck, FiUsers } from 'react-icons/fi';
import { publicService } from '../../services/publicService';
import { captainService } from '../../services/captainService';
import Swal from 'sweetalert2';

export default function InviteTeamModal({ isOpen, onClose, matchId, onInviteSuccess }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen, search]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const res = await publicService.getTeams({ search, pageSize: 20 });
      setTeams(res.teams || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (teamId) => {
    try {
      await captainService.inviteTeamToMatch(matchId, teamId);
      Swal.fire('Thành công', 'Đã gửi lời mời đến đội này!', 'success');
      onInviteSuccess();
      onClose();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <FiUsers className="text-indigo-500" /> Mời đội bóng
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên đội..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Đang tải...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Không tìm thấy đội nào.</div>
          ) : (
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.teamId || team.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                      {(team.teamName || team.name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{team.teamName || team.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Điểm: {team.rankingScore || 0}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleInvite(team.teamId || team.id)}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                  >
                    Mời
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
