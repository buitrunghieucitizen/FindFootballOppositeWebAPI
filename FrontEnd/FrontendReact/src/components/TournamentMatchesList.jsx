import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiCalendar, FiClock, FiSettings, FiPlay } from 'react-icons/fi';
import { publicService } from '../services/publicService';

export default function TournamentMatchesList({ tournamentId, service, settings }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [pitches, setPitches] = useState([]);

  useEffect(() => {
    loadMatches();
    loadPitches();
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

  const loadPitches = async () => {
    try {
      if (settings?.stadiumId) {
        const stadiums = await publicService.getStadiums();
        const std = stadiums.find(s => s.stadiumId === settings.stadiumId);
        if (std && std.pitches) {
          setPitches(std.pitches);
        }
      }
    } catch (e) {
      console.warn("Lỗi tải sân", e);
    }
  };

  const startEdit = (match) => {
    setEditingId(match.matchId);
    setEditForm({
      matchDate: match.matchDate ? match.matchDate.split('T')[0] : '',
      startTime: match.startTime || '',
      endTime: match.endTime || '',
      durationMinutes: match.durationMinutes || 90,
      hasExtraTime: match.hasExtraTime || false,
      pitchId: match.pitchId || '',
      location: match.location || '',
      locationType: match.pitchId ? 'internal' : (match.location ? 'external' : 'internal'),
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0,
      setScores: match.setScores || '',
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
        startTime: editForm.startTime ? (editForm.startTime.split(':').length === 2 ? `${editForm.startTime}:00` : editForm.startTime) : null,
        endTime: editForm.endTime ? (editForm.endTime.split(':').length === 2 ? `${editForm.endTime}:00` : editForm.endTime) : null,
        durationMinutes: parseInt(editForm.durationMinutes) || 90,
        hasExtraTime: editForm.hasExtraTime,
        pitchId: editForm.locationType === 'internal' && editForm.pitchId ? parseInt(editForm.pitchId) : null,
        location: editForm.locationType === 'external' ? editForm.location : null,
        homeScore: (editForm.homeScore === '' || editForm.homeScore === null || editForm.homeScore === undefined) ? null : parseInt(editForm.homeScore, 10),
        awayScore: (editForm.awayScore === '' || editForm.awayScore === null || editForm.awayScore === undefined) ? null : parseInt(editForm.awayScore, 10),
        setScores: editForm.setScores || null,
        matchStatus: editForm.matchStatus
      });
      alert('Cập nhật trận đấu thành công');
      setEditingId(null);
      await loadMatches();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi khi cập nhật trận đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSchedule = async () => {
    if (confirm('Tự động xếp lịch sẽ random thời gian và sân cho TẤT CẢ các trận chưa có lịch. Tiếp tục?')) {
      try {
        setLoading(true);
        const res = await service.autoScheduleMatches(tournamentId);
        alert(res.message);
        await loadMatches();
      } catch (e) {
        alert(e.response?.data?.message || 'Lỗi khi tự động xếp lịch');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartTournament = async () => {
    if (confirm('Bắt đầu giải đấu? Trạng thái sẽ được cập nhật thành Đang diễn ra.')) {
      try {
        setLoading(true);
        const res = await service.startTournament(tournamentId);
        alert(res.message);
        if (settings) settings.status = 'InProgress';
      } catch (e) {
        alert(e.response?.data?.message || 'Lỗi khi bắt đầu giải đấu');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && matches.length === 0) return <div className="p-4 text-center">Đang tải trận đấu...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Quản lý Lịch thi đấu</h3>
        
        <div className="flex flex-wrap gap-2">
          {matches.length > 0 && (
            <button 
              type="button"
              onClick={handleAutoSchedule} 
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition-colors"
            >
              <FiSettings /> Random Hệ Thống
            </button>
          )}
          
          {settings?.status !== 'InProgress' && settings?.status !== 'Completed' && (
            <button 
              type="button"
              onClick={handleStartTournament} 
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <FiPlay /> Bắt đầu giải đấu
            </button>
          )}

          <button type="button" onClick={loadMatches} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
            Làm mới
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500">Chưa có trận đấu nào. Vui lòng xếp lịch ở tab Sơ đồ nhánh.</div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 rounded-tl-xl font-bold">Vòng</th>
                <th className="p-4 font-bold">Đội nhà</th>
                <th className="p-4 font-bold text-center">Tỉ số</th>
                <th className="p-4 font-bold">Đội khách</th>
                <th className="p-4 font-bold">Thời gian & Địa điểm</th>
                <th className="p-4 font-bold">Trạng thái</th>
                <th className="p-4 rounded-tr-xl font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(m => (
                <tr key={m.matchId} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {m.tournamentStage || 'Vòng bảng'}
                  </td>
                  
                  {editingId === m.matchId ? (
                    <td colSpan={6} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        {/* Hàng 1: Điểm số & Trạng thái */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold w-20 text-slate-700 dark:text-slate-300">Tỉ số:</span>
                          <input type="number" className="w-16 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-center font-bold" value={editForm.homeScore} onChange={e => setEditForm({...editForm, homeScore: e.target.value})} title="Điểm đội nhà" />
                          <span className="text-slate-400">-</span>
                          <input type="number" className="w-16 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-center font-bold" value={editForm.awayScore} onChange={e => setEditForm({...editForm, awayScore: e.target.value})} title="Điểm đội khách" />
                          <input type="text" className="w-24 ml-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-center text-sm" value={editForm.setScores || ''} onChange={e => setEditForm({...editForm, setScores: e.target.value})} placeholder="Set scores..." title="Tỉ số các set" />
                          
                          <select className="ml-4 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm font-medium" value={editForm.matchStatus} onChange={e => setEditForm({...editForm, matchStatus: e.target.value})}>
                            <option value="Scheduled">Chưa đá</option>
                            <option value="Ongoing">Đang đá</option>
                            <option value="Completed">Đã kết thúc</option>
                            <option value="Cancelled">Hủy</option>
                          </select>
                        </div>

                        {/* Hàng 2: Thời gian thi đấu */}
                        <div className="flex flex-wrap items-center gap-3">
                          <input type="date" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" value={editForm.matchDate} onChange={e => setEditForm({...editForm, matchDate: e.target.value})} />
                          <input type="time" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" value={editForm.startTime} onChange={e => setEditForm({...editForm, startTime: e.target.value})} />
                        </div>

                        {/* Hàng 3: Cấu hình trận đấu */}
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Thời lượng:</span>
                            <input type="number" className="w-16 p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-center text-sm" value={editForm.durationMinutes} onChange={e => setEditForm({...editForm, durationMinutes: e.target.value})} />
                            <span className="text-sm text-slate-500">phút</span>
                          </div>
                          
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" checked={editForm.hasExtraTime} onChange={e => setEditForm({...editForm, hasExtraTime: e.target.checked})} />
                            Có hiệp phụ
                          </label>
                        </div>

                        {/* Hàng 4: Chọn sân */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold w-20 text-slate-700 dark:text-slate-300">Sân:</span>
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name="locType" value="internal" checked={editForm.locationType === 'internal'} onChange={() => setEditForm({...editForm, locationType: 'internal'})} /> 
                                <span className="text-sm font-medium">Sân hệ thống</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input type="radio" name="locType" value="external" checked={editForm.locationType === 'external'} onChange={() => setEditForm({...editForm, locationType: 'external'})} /> 
                                <span className="text-sm font-medium">Sân ngoài</span>
                              </label>
                            </div>
                            
                            {editForm.locationType === 'internal' ? (
                              <select className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm font-medium" value={editForm.pitchId} onChange={e => setEditForm({...editForm, pitchId: e.target.value})}>
                                <option value="">-- Chọn sân hệ thống --</option>
                                {pitches && pitches.map(p => (
                                  <option key={p.pitchId} value={p.pitchId}>{p.pitchName} ({p.sportName})</option>
                                ))}
                              </select>
                            ) : (
                              <input type="text" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" placeholder="Nhập địa điểm sân ngoài" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                            )}
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="md:col-span-2 flex justify-end gap-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <FiX /> Hủy
                          </button>
                          <button type="button" onClick={saveEdit} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2">
                            <FiSave /> Lưu
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="p-4 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 uppercase">{m.homeTeamName?.substring(0,2)}</div>
                          {m.homeTeamName}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center justify-center min-w-[3rem] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-lg font-black text-emerald-600 dark:text-emerald-400">
                          <div>{m.homeScore} - {m.awayScore}</div>
                          {m.setScores && <div className="text-xs text-slate-500 font-bold mt-1">({m.setScores})</div>}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 uppercase">{m.awayTeamName?.substring(0,2)}</div>
                          {m.awayTeamName}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-slate-400" />
                            {m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : '--/--/----'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiClock className="text-slate-400" />
                            {m.startTime ? m.startTime.substring(0,5) : '--:--'}
                            {m.endTime ? ` - ${m.endTime.substring(0,5)}` : ''}
                            {m.hasExtraTime && <span className="text-xs text-emerald-600 font-bold ml-1">(+HP)</span>}
                          </div>
                          {m.location && (
                            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 py-0.5 px-2 rounded w-fit">
                              📍 {m.location}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          m.matchStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          m.matchStatus === 'Ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          m.matchStatus === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {m.matchStatus === 'Completed' ? 'Kết thúc' : 
                           m.matchStatus === 'Ongoing' ? 'Đang đá' : 
                           m.matchStatus === 'Cancelled' ? 'Đã Hủy' : 'Chưa đá'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          type="button"
                          onClick={() => startEdit(m)} 
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Chỉnh sửa trận đấu"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
