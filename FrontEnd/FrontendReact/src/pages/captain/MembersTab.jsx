import { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import { captainService } from '../../services/captainService';
import { useAuth } from '../../contexts/AuthContext';

export default function MembersTab() {
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [newRole, setNewRole] = useState('Player');
  const { logout } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const teamData = await captainService.getMyTeam();
      if (teamData?.teamId) {
        const [membersData, requestsData] = await Promise.all([
          captainService.getMembers(teamData.teamId),
          captainService.getJoinRequests(teamData.teamId)
        ]);
        setMembers(membersData || []);
        setRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Error fetching members/requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await captainService.acceptMember(requestId);
      loadData(); // reload
    } catch (error) {
      console.error('Error accepting member', error);
      alert('Có lỗi xảy ra khi duyệt thành viên');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) return;
    try {
      await captainService.rejectMember(requestId);
      loadData(); // reload
    } catch (error) {
      console.error('Error rejecting member', error);
      alert('Có lỗi xảy ra khi từ chối thành viên');
    }
  };

  const handleTransferRole = async () => {
    if (!selectedMemberId) return alert('Vui lòng chọn thành viên');
    try {
      await captainService.transferRole({
        newCaptainId: parseInt(selectedMemberId),
        newRoleForOldCaptain: newRole
      });
      alert('Chuyển quyền thành công! Bạn sẽ được đăng xuất để cập nhật quyền.');
      setShowTransferModal(false);
      logout();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi chuyển quyền');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</div>;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Requests Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <FiUserPlus className="text-blue-500" /> Yêu cầu tham gia
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{requests.length}</span>
        </h2>
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req.requestId} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{req.fullName || req.username || 'Người chơi'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{req.message || 'Không có lời nhắn'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.requestId)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
                    title="Duyệt"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={() => handleReject(req.requestId)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    title="Từ chối"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Hiện không có yêu cầu tham gia nào.
          </div>
        )}
      </div>

      {/* Members Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiUsers className="text-emerald-500" /> Thành viên hiện tại
            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs">{members.length}</span>
          </h2>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw /> Chuyển quyền Đội trưởng
          </button>
        </div>
        {members.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tên cầu thủ</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Vai trò</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tỷ lệ tham gia</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {members.map((member, index) => (
                  <tr key={member.playerId || member.memberId || index} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{member.fullName || member.username || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
 member.roleInTeam === 'Captain' || member.roleInTeam === 'Owner' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
 }`}>
                        {member.roleInTeam === 'Captain' ? 'Đội trưởng' :
                         member.roleInTeam === 'Owner' ? 'Chủ quản' :
                         member.roleInTeam === 'Player' ? 'Cầu thủ' :
                         member.roleInTeam === 'Member' ? 'Thành viên' :
                         (member.roleInTeam || 'Thành viên')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{member.participationRate != null ? `${member.participationRate}%` : 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Đội chưa có thành viên nào.
          </div>
        )}
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Chuyển quyền Đội trưởng</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-300">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Chọn Đội trưởng mới</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">-- Chọn thành viên --</option>
                  {members.filter(m => m.roleInTeam !== 'Captain').map(m => (
                    <option key={m.playerId} value={m.playerId}>{m.fullName} ({m.username})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Vai trò mới của bạn</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="Player">Cầu thủ bình thường (Player)</option>
                  <option value="Owner">Chủ CLB (Club Owner)</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lưu ý: Sau khi chuyển quyền, bạn sẽ bị đăng xuất để hệ thống cập nhật lại quyền hạn.</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700/50">
              <button 
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleTransferRole}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
