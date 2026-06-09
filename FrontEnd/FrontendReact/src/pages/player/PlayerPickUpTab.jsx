import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiActivity, FiTarget } from 'react-icons/fi';
import playerService from '../../services/playerService';
import sportService from '../../services/sportService';
import PaywallModal from '../../components/PaywallModal';

export default function PlayerPickUpTab() {
  const [matchLoading, setMatchLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  // Paywall state
  const [paywallData, setPaywallData] = useState(null);
  const [sports, setSports] = useState([]);
  const [matchForm, setMatchForm] = useState({ 
    sportId: 1, 
    expiresAt: '',
    location: '',
    qualityLevel: 'Trung bình yếu',
    description: ''
  });

  const [pickupMatches, setPickupMatches] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    loadSports();
    loadPickupMatches();
  }, []);

  const loadPickupMatches = async () => {
    try {
      setPickupLoading(true);
      const res = await playerService.getPickupMatches();
      setPickupMatches(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đá lẻ:', err);
    } finally {
      setPickupLoading(false);
    }
  };

  const handleJoinPickup = async (postId) => {
    try {
      setJoiningId(postId);
      setError(null);
      setMessage(null);
      const res = await playerService.joinPickupMatch(postId);
      setMessage(res.data.message || 'Xin tham gia thành công!');
    } catch (err) {
      if (err.response?.data?.requiresPayment) {
        setPaywallData(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi xin tham gia.');
      }
    } finally {
      setJoiningId(null);
    }
  };

  const loadSports = async () => {
    try {
      const res = await sportService.getSports();
      const sportsData = res.data?.data || res.data?.$values || res.data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error('Lỗi tải môn thể thao:', err);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      setMatchLoading(true);
      setError(null);
      setMessage(null);
      const res = await playerService.createIndividualMatch(matchForm);
      setMessage(res.data.message);
      setMatchForm({ ...matchForm, description: '', location: '' }); // reset some fields
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo trận. Vui lòng thử lại.');
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <FiCalendar className="text-xl" />
          </div>
          Tạo Kèo Giao Lưu (Cá Nhân)
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 ml-14">
          Tạo một trận đấu riêng để tìm đối tác hoặc mời mọi người xung quanh cùng tham gia mà không cần thông qua Câu lạc bộ. (Giới hạn 3 trận/tháng với người chơi thường).
        </p>

        {message && <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl font-medium border border-emerald-100">{message}</div>}
        {error && <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl font-medium border border-rose-100 dark:border-rose-800">{error}</div>}
        
        <form onSubmit={handleCreateMatch} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><FiActivity /> Môn thể thao</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={matchForm.sportId}
                onChange={e => setMatchForm({ ...matchForm, sportId: Number(e.target.value) })}
              >
                {sports.map(s => (
                  <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><FiTarget /> Trình độ mong muốn</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                value={matchForm.qualityLevel}
                onChange={e => setMatchForm({ ...matchForm, qualityLevel: e.target.value })}
              >
                <option value="Yếu">Yếu</option>
                <option value="Trung bình yếu">Trung bình yếu</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Trung bình khá">Trung bình khá</option>
                <option value="Khá">Khá</option>
                <option value="Mạnh">Mạnh</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><FiMapPin /> Địa chỉ thi đấu (Dự kiến)</label>
              <input 
                type="text" 
                required
                placeholder="VD: Sân Chùa Láng, Đống Đa"
                value={matchForm.location}
                onChange={e => setMatchForm({...matchForm, location: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2"><FiCalendar /> Thời gian diễn ra</label>
              <input 
                type="datetime-local" 
                required
                value={matchForm.expiresAt}
                onChange={e => setMatchForm({...matchForm, expiresAt: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mô tả thêm</label>
            <textarea 
              rows="3"
              placeholder="Ghi chú thêm về kèo đấu, quy định chia tiền, v.v."
              value={matchForm.description}
              onChange={e => setMatchForm({...matchForm, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button 
              type="submit" 
              disabled={matchLoading}
              className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {matchLoading ? 'Đang tạo...' : 'Tạo Kèo Nhanh Chóng'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <FiActivity className="text-xl" />
          </div>
          Tìm trận đá ké
        </h3>

        {pickupLoading ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">Đang tải danh sách...</div>
        ) : pickupMatches.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50">Hiện không có trận đấu lẻ nào đang cần người.</div>
        ) : (
          <div className="grid gap-4">
            {pickupMatches.map(post => (
              <div key={post.postId} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                <div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white">{post.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{post.content}</p>
                  <div className="flex gap-3 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><FiTarget /> {post.match?.sport?.sportName || 'Thể thao'}</span>
                    <span className="flex items-center gap-1"><FiCalendar /> {post.match?.expiresAt ? new Date(post.match.expiresAt).toLocaleDateString('vi-VN') : 'Sắp tới'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinPickup(post.postId)}
                  disabled={joiningId === post.postId}
                  className="w-full md:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {joiningId === post.postId ? 'Đang gửi...' : 'Xin Đá Ké'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaywallModal 
        isOpen={!!paywallData} 
        onClose={() => setPaywallData(null)} 
        paywallData={paywallData} 
      />
    </div>
  );
}
