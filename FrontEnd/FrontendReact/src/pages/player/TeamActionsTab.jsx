import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';
import sportService from '../../services/sportService';
import { FiUsers, FiMapPin, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function TeamActionsTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const [sports, setSports] = useState([]);

  const [formData, setFormData] = useState({
    teamName: '',
    homeArea: '',
    qualityLevel: 'Trung bình yếu',
    sportId: 1
  });

  useEffect(() => {
    loadMyTeam();
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      const res = await sportService.getSports();
      const sportsData = res.data?.data || res.data?.$values || res.data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error('Lỗi tải môn thể thao:', err);
    }
  };

  const loadMyTeam = async () => {
    try {
      setLoading(true);
      const res = await playerService.getMyTeam();
      setTeam(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setTeam(null);

      } else {
        setError('Không thể tải thông tin đội thể thao.');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError(null);
      const res = await playerService.createTeam(formData);
      
      if (res.data?.roleChanged) {
        setSuccess(res.data.message);
        
        // Cập nhật token và user info
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          
          const currentUser = JSON.parse(localStorage.getItem('user')) || {};
          currentUser.role = res.data.role || 'Captain';
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          // Force page reload to re-initialize context with new role and token
          window.location.href = '/captain-home';
        }, 1500);
      } else {
        setSuccess('Tạo đội thành công!');
        loadMyTeam();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo đội. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời đội không?')) return;
    try {
      setActionLoading(true);
      setError(null);
      await playerService.leaveTeam();
      setSuccess('Rời đội thành công!');
      setTeam(null);

    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi rời đội.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyToTeam = async (teamId) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await playerService.requestJoin(teamId);
      Swal.fire({
        title: 'Thành công!',
        text: 'Đã gửi yêu cầu tham gia đội thành công!',
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu. Bạn có thể đã gửi yêu cầu trước đó.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 dark:text-slate-400 animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản Lý Đội Của Tôi</h2>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {team ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-800 dark:text-white">
              <FiUsers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-slate-800 dark:text-white">Thành viên đội {team.teamName || team.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Danh sách các thành viên hiện tại của đội thể thao.</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <div key={member.playerId} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{member.playerName}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Tham gia: {new Date(member.joinedDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.roleInTeam === 'Captain' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
                  }`}>
                    {member.roleInTeam === 'Captain' ? 'Đội trưởng' : 'Thành viên'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Chưa có thông tin thành viên.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Team Form */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50">
            <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 dark:text-white flex items-center justify-center"><FiUsers /></div>
              Tạo đội mới
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Tên đội thể thao</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.teamName}
                  onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="VD: FC Gà Trống"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Khu vực nhà</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.homeArea}
                  onChange={e => setFormData({ ...formData, homeArea: e.target.value })}
                  placeholder="VD: Quận 1, TP.HCM"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Môn thể thao</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.sportId}
                  onChange={e => setFormData({ ...formData, sportId: Number(e.target.value) })}
                >
                  {sports.map(s => (
                    <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Trình độ</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  value={formData.qualityLevel}
                  onChange={e => setFormData({ ...formData, qualityLevel: e.target.value })}
                >
                  <option value="Yếu">Yếu</option>
                  <option value="Trung bình yếu">Trung bình yếu</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Trung bình khá">Trung bình khá</option>
                  <option value="Khá">Khá</option>
                  <option value="Mạnh">Mạnh</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 mt-4"
              >
                {actionLoading ? 'Đang tạo...' : 'Tạo đội thể thao'}
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}

