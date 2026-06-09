import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiCalendar, FiClock } from 'react-icons/fi';

export default function TournamentMatchesList({ tournamentId, service }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await service.getTournamentMatches(tournamentId);
      setMatches(data || []);
    } catch (e) {
      console.warn("Lỗi tải trận đấu", e);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (match) => {
    setEditingId(match.matchId);
    setEditForm({
      matchDate: match.matchDate ? match.matchDate.split('T')[0] : '',
      startTime: match.startTime || '',
      endTime: match.endTime || '',
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      matchStatus: match.matchStatus || 'Scheduled'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      await service.updateTournamentMatch(editingId, {
        matchDate: editForm.matchDate || null,
        startTime: editForm.startTime || null,
        endTime: editForm.endTime || null,
        homeScore: parseInt(editForm.homeScore, 10),
        awayScore: parseInt(editForm.awayScore, 10),
        matchStatus: editForm.matchStatus
      });
      alert('Cập nhật trận đấu thành công');
      setEditingId(null);
      await loadMatches();
    } catch (e) {
      alert('Lỗi khi cập nhật trận đấu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && matches.length === 0) return <div className="p-4 text-center">Đang tải trận đấu...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Lịch thi đấu & Cập nhật kết quả</h3>
        <button onClick={loadMatches} className="text-emerald-600 text-sm font-bold hover:underline">Làm mới</button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500">Chưa có trận đấu nào. Vui lòng xếp lịch ở tab Sơ đồ nhánh.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm">
                <th className="p-3 rounded-tl-xl">Vòng</th>
                <th className="p-3">Đội nhà</th>
                <th className="p-3">Tỉ số</th>
                <th className="p-3">Đội khách</th>
                <th className="p-3">Ngày</th>
                <th className="p-3">Giờ</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 rounded-tr-xl">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.matchId} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-sm font-medium">{m.tournamentStage || 'N/A'}</td>
                  <td className="p-3 text-sm font-bold text-slate-700 dark:text-slate-200">{m.homeTeamName}</td>
                  
                  {editingId === m.matchId ? (
                    <td colSpan={5} className="p-3">
                      <div className="flex flex-wrap gap-2 items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                        <input type="number" className="w-16 p-1 border rounded text-center" value={editForm.homeScore} onChange={e => setEditForm({...editForm, homeScore: e.target.value})} title="Điểm đội nhà" />
                        <span>-</span>
                        <input type="number" className="w-16 p-1 border rounded text-center" value={editForm.awayScore} onChange={e => setEditForm({...editForm, awayScore: e.target.value})} title="Điểm đội khách" />
                        
                        <input type="date" className="p-1 border rounded text-sm" value={editForm.matchDate} onChange={e => setEditForm({...editForm, matchDate: e.target.value})} />
                        <input type="time" className="p-1 border rounded text-sm" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} />
                        <span>đến</span>
                        <input type="time" className="p-1 border rounded text-sm" value={editForm.endTime} onChange={e => setEditForm({...editForm, endTime: e.target.value})} />
                        
                        <select className="p-1 border rounded text-sm" value={editForm.matchStatus} onChange={e => setEditForm({...editForm, matchStatus: e.target.value})}>
                          <option value="Scheduled">Chưa đá</option>
                          <option value="Ongoing">Đang đá</option>
                          <option value="Completed">Đã kết thúc</option>
                          <option value="Cancelled">Hủy</option>
                        </select>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="p-3 text-lg font-black text-emerald-600">
                        {m.homeScore} - {m.awayScore}
                      </td>
                      <td className="p-3 text-sm font-bold text-slate-700 dark:text-slate-200">{m.awayTeamName}</td>
                      <td className="p-3 text-sm text-slate-500">{m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : '--/--/----'}</td>
                      <td className="p-3 text-sm text-slate-500">
                        {m.startTime ? m.startTime.substring(0,5) : '--:--'} - {m.endTime ? m.endTime.substring(0,5) : '--:--'}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          m.matchStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          m.matchStatus === 'Ongoing' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{m.matchStatus === 'Completed' ? 'Kết thúc' : m.matchStatus === 'Ongoing' ? 'Đang đá' : 'Chưa đá'}</span>
                      </td>
                    </>
                  )}
                  
                  <td className="p-3">
                    {editingId === m.matchId ? (
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><FiSave /></button>
                        <button onClick={cancelEdit} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><FiX /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(m)} className="p-1.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"><FiEdit2 /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
