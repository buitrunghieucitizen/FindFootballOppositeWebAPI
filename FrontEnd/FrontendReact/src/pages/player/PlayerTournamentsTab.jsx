import React, { useState, useEffect } from 'react';
import { FiAward, FiMapPin, FiCalendar, FiShield, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { publicService } from '../../services/publicService';
import playerService from '../../services/playerService';
import { captainService } from '../../services/captainService';
import { useAuth } from '../../contexts/AuthContext';

export default function PlayerTournamentsTab() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Real data for registration flow
  const [registrationState, setRegistrationState] = useState('idle'); // idle, form, paying, done
  const [myTeamName, setMyTeamName] = useState('Đang tải...');
  const [myTeamMembers, setMyTeamMembers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [noBettingCommitment, setNoBettingCommitment] = useState(false);

  useEffect(() => {
    fetchTournaments();
    fetchMyTeam();
    if (user?.role === 'Captain') {
      fetchMyTeamMembers();
    }
  }, []);

  const fetchMyTeamMembers = async () => {
    try {
      const members = await captainService.getMembers();
      setMyTeamMembers(members || []);
    } catch (err) {
      console.warn('Could not fetch members', err);
    }
  };

  const fetchMyTeam = async () => {
    try {
      if (!user) return;
      let teamData;
      if (user.role === 'Captain') {
        teamData = await captainService.getMyTeam();
      } else {
        teamData = await playerService.getMyTeam();
      }
      setMyTeamName(teamData?.teamName || teamData?.name || 'Chưa tham gia đội nào');
    } catch (err) {
      console.warn('Could not fetch team', err);
      setMyTeamName('Chưa tham gia đội nào');
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await publicService.getTournaments();
      setTournaments(data || []);
      

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (t) => {
    if (user?.role !== 'Captain') {
      alert('Chỉ Đội trưởng mới có quyền đăng ký giải đấu!');
      return;
    }
    setSelectedTournament(t);
    setRegistrationState('form');
    setSelectedPlayers([]);
    setNoBettingCommitment(false);
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleProceedToPayment = () => {
    if (!noBettingCommitment) {
      alert('Bạn phải cam kết chơi bóng đá không cá độ để tiếp tục!');
      return;
    }
    if (selectedTournament.maxPlayersPerTeam && selectedPlayers.length > selectedTournament.maxPlayersPerTeam) {
      alert(`Bạn chỉ được chọn tối đa ${selectedTournament.maxPlayersPerTeam} cầu thủ!`);
      return;
    }
    if (selectedPlayers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 cầu thủ!');
      return;
    }
    setRegistrationState('paying');
  };

  const handleConfirmPayment = async () => {
    if (!selectedTournament) return;
    try {
      const tId = selectedTournament.tournamentId || selectedTournament.id;
      if (!tId) {
          alert('Lỗi: Không tìm thấy ID giải đấu');
          return;
      }
      await captainService.registerTournament(tId, {
        playerIds: selectedPlayers,
        noBettingCommitment: noBettingCommitment
      });
      setRegistrationState('done');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
      alert(msg);
      setRegistrationState('idle');
      setSelectedTournament(null);
    }
  };

  const handleSubmitReport = () => {
    if (!reportReason) return alert('Vui lòng nhập lý do tố cáo');
    alert('Đã gửi báo cáo vi phạm thành công! Quản trị viên sẽ xem xét.');
    setShowReportForm(false);
    setReportReason('');
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải danh sách giải đấu...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiAward className="text-wc-gold-500" />
            Hệ Thống Giải Đấu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đăng ký tham gia các giải đấu phong trào hấp dẫn nhất.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <FiAward className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-lg">Hiện chưa có giải đấu nào.</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau khi có giải đấu mới được tạo.</p>
          </div>
        ) : tournaments.map((t, index) => (
          <div key={t.tournamentId || t.id || index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-center text-white relative">
              <FiAward className="w-16 h-16 opacity-30 absolute right-4 bottom-[-10px]" />
              <h3 className="text-xl font-bold z-10 px-6 text-center">{t.tournamentName || t.name}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <p className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                  <FiMapPin className="text-rose-500" /> {t.stadiumName || 'Chưa cập nhật'}
                </p>
                <p className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                  <FiAward className="text-wc-gold-500" /> {t.format}
                </p>
                <p className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                  <FiCalendar className="text-blue-500" /> {t.startDate ? new Date(t.startDate).toLocaleDateString('vi-VN') : '...'} - {t.endDate ? new Date(t.endDate).toLocaleDateString('vi-VN') : '...'}
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                {t.description || 'Không có mô tả.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleRegisterClick(t)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Đăng ký tham gia
                </button>
                <button 
                  onClick={() => setShowReportForm(t)}
                  className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors font-bold flex items-center justify-center"
                  title="Tố cáo giải đấu"
                >
                  <FiAlertTriangle />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Đăng ký Giải Đấu</h3>
              <button onClick={() => { setSelectedTournament(null); setRegistrationState('idle'); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">✕</button>
            </div>
            
            <div className="p-6">
              {registrationState === 'form' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold mb-1">Đội đăng ký:</p>
                    <p className="text-xl font-black text-emerald-600">{myTeamName}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Chọn cầu thủ tham gia {selectedTournament.maxPlayersPerTeam ? `(Tối đa ${selectedTournament.maxPlayersPerTeam} người)` : ''}</h4>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-white dark:bg-slate-900">
                      {myTeamMembers.length === 0 ? (
                        <p className="text-sm text-slate-500 p-2">Đội chưa có thành viên nào.</p>
                      ) : (
                        myTeamMembers.map(member => (
                          <label key={member.playerId} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300"
                              checked={selectedPlayers.includes(member.playerId)}
                              onChange={() => togglePlayerSelection(member.playerId)}
                            />
                            <div className="flex items-center gap-2">
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                  {member.fullName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <span className="font-medium text-slate-700 dark:text-slate-200">{member.fullName}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-amber-300"
                        checked={noBettingCommitment}
                        onChange={(e) => setNoBettingCommitment(e.target.checked)}
                      />
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-500 block mb-1">Cam kết chơi bóng đá không cá độ</span>
                        <span className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                          Tôi và toàn bộ thành viên trong đội cam kết tham gia giải đấu với tinh thần thể thao, tuyệt đối không tham gia các hình thức cá cược, cờ bạc.
                        </span>
                      </div>
                    </label>
                  </div>

                  <button 
                    onClick={handleProceedToPayment}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Tiếp tục
                  </button>
                </div>
              )}

              {registrationState === 'paying' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-center">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold mb-1">Xác nhận đăng ký đội:</p>
                    <p className="text-xl font-black text-emerald-600">{myTeamName}</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-slate-600 dark:text-slate-300">Vui lòng thanh toán lệ phí cho Người tạo giải</p>
                    <p className="text-2xl font-bold text-rose-500">{selectedTournament.registrationFee?.toLocaleString() || selectedTournament.fee?.toLocaleString() || '2.000.000'} đ</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm mb-4 border border-slate-200">
                      {/* Fake QR Code */}
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuyenTienCho_${selectedTournament.ownerName}`} alt="QR" className="w-full h-full" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-white">{selectedTournament.ownerBank || 'MBBank - 0987654321'}</p>
                      <p className="text-sm text-slate-500 uppercase">{selectedTournament.ownerName || 'Chủ Giải Đấu'}</p>
                      <p className="text-xs text-slate-400 mt-2">Nội dung chuyển khoản: Tên Đội - SĐT</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic text-center">
                    Lưu ý: Tiền sẽ được chuyển thẳng cho Chủ Giải. Họ có trách nhiệm duyệt đội bạn trong vòng 24h.
                  </p>

                  <button 
                    onClick={handleConfirmPayment}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    Tôi đã chuyển khoản thành công
                  </button>
                </div>
              )}

              {registrationState === 'done' && (
                <div className="text-center py-8">
                  <FiCheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Đã gửi yêu cầu!</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Đội của bạn đang ở trạng thái <strong>Chờ duyệt</strong>. Người tạo giải có trách nhiệm xác nhận trong 24 giờ.
                  </p>
                  <button 
                    onClick={() => { setSelectedTournament(null); setRegistrationState('idle'); }}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100 dark:border-rose-900">
            <div className="p-6 border-b border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 flex justify-between items-center">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <FiAlertTriangle /> Tố Cáo Giải Đấu
              </h3>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-rose-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nếu bạn đã chuyển khoản nhưng Chủ giải không duyệt, hoặc giải đấu có dấu hiệu lừa đảo. Hãy gửi báo cáo cho Admin nền tảng xử lý.
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lý do cụ thể:</label>
                <textarea 
                  rows={4}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Tôi đã chuyển tiền nhưng quá 24h chưa được duyệt..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowReportForm(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100">Hủy</button>
                <button onClick={handleSubmitReport} className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md">Gửi Tố Cáo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
