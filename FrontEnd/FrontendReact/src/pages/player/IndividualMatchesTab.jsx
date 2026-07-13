import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiActivity, FiSearch, FiClock, FiCheckCircle, FiX, FiStar } from 'react-icons/fi';
import playerService from '../../services/playerService';
import sportService from '../../services/sportService';
import { publicService } from '../../services/publicService';
import Swal from 'sweetalert2';
import CreateIndividualMatch from './CreateIndividualMatch';
import LocationDisplay from '../../components/LocationDisplay';
import ScoreModal from '../../components/ScoreModal';

export default function IndividualMatchesTab() {
  const [activeTab, setActiveTab] = useState('my-matches'); // 'my-matches', 'pickup', 'create'
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  
  const [pickupMatches, setPickupMatches] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupFilters, setPickupFilters] = useState({ search: '', sportId: '' });

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreMatch, setScoreMatch] = useState(null);

  useEffect(() => {
    loadSports();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-matches') {
      loadMyMatches();
      loadRequests();
    } else if (activeTab === 'pickup') {
      loadPickupMatches();
    }
  }, [activeTab]);

  const loadSports = async () => {
    try {
      const res = await sportService.getSports();
      const sportsData = res.data?.data || res.data?.$values || res.data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error('Lỗi tải môn thể thao:', err);
    }
  };

  const loadMyMatches = async () => {
    try {
      setLoading(true);
      const res = await playerService.getIndividualMatches();
      const matchData = res?.data || res?.$values || res || [];
      setMatches(Array.isArray(matchData) ? matchData : []);
    } catch (err) {
      console.error('Lỗi tải trận đấu của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPickupMatches = async () => {
    try {
      setPickupLoading(true);
      const res = await publicService.getIndividualMatches(pickupFilters);
      const data = res?.data || res?.$values || res || [];
      // Backend should already filter by IsIndividualMatch
      const filtered = (Array.isArray(data) ? data : []).filter(m => m.matchStatus === 'LookingForOpponent' || m.matchStatus === 'Pending');
      setPickupMatches(filtered);
    } catch (err) {
      console.error('Lỗi tải kèo công khai:', err);
    } finally {
      setPickupLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await playerService.getIndividualMatchRequests();
      const reqData = res?.data || res?.$values || res || [];
      setRequests(Array.isArray(reqData) ? reqData : []);
    } catch (err) {
      console.error('Lỗi tải yêu cầu:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleJoin = async (matchId) => {
    try {
      const { value: message } = await Swal.fire({
        title: 'Lời nhắn bắt kèo',
        input: 'textarea',
        inputPlaceholder: 'Nhập lời nhắn cho đối thủ...',
        showCancelButton: true,
        confirmButtonText: 'Gửi yêu cầu',
        cancelButtonText: 'Hủy'
      });
      if (message !== undefined) {
        await playerService.requestIndividualMatch(matchId, { message });
        Swal.fire('Thành công', 'Đã gửi yêu cầu bắt kèo!', 'success');
        loadPickupMatches();
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await playerService.acceptIndividualMatchRequest(requestId);
      Swal.fire('Thành công', 'Đã chốt kèo thành công!', 'success');
      loadRequests();
      loadMyMatches();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await playerService.rejectIndividualMatchRequest(requestId);
      Swal.fire('Đã từ chối', 'Đã từ chối lời mời.', 'info');
      loadRequests();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const openScoreModal = (match) => {
    setScoreMatch(match);
    setShowScoreModal(true);
  };

  const submitScore = async (data) => {
    try {
      await playerService.updateIndividualMatchScore(scoreMatch.matchId || scoreMatch.id, data);
      Swal.fire('Thành công', 'Đã cập nhật tỉ số!', 'success');
      setShowScoreModal(false);
      loadMyMatches();
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const handleRate = async (matchId) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Đánh giá đối thủ',
        html:
          '<select id="swal-rating" class="swal2-input"><option value="5">5 Sao - Rất tốt</option><option value="4">4 Sao - Tốt</option><option value="3">3 Sao - Bình thường</option><option value="2">2 Sao - Kém</option><option value="1">1 Sao - Rất kém</option></select>' +
          '<textarea id="swal-comment" class="swal2-textarea" placeholder="Nhận xét..."></textarea>',
        focusConfirm: false,
        preConfirm: () => {
          return {
            rating: parseInt(document.getElementById('swal-rating').value),
            comment: document.getElementById('swal-comment').value
          }
        },
        showCancelButton: true,
        confirmButtonText: 'Gửi đánh giá'
      });

      if (formValues) {
        await playerService.rateIndividualOpponent(matchId, formValues);
        Swal.fire('Thành công', 'Đã đánh giá đối thủ!', 'success');
        loadMyMatches();
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra.', 'error');
    }
  };

  const getStatusText = (status) => {
    if (status === 'PendingConfirmation') return 'Đang xác nhận';
    if (status === 'Pending' || status === 'LookingForOpponent') return 'Đang tìm đối';
    if (status === 'Scheduled') return 'Đã lên lịch';
    if (status === 'Completed') return 'Đã kết thúc';
    if (status === 'Cancelled') return 'Đã hủy';
    if (status === 'ExternalBooked') return 'Đã đặt sân ngoài';
    return status;
  };

  const getStatusColor = (status) => {
    if (status === 'PendingConfirmation') return 'bg-purple-100 text-purple-700';
    if (status === 'Pending' || status === 'LookingForOpponent') return 'bg-amber-100 text-amber-700';
    if (status === 'Scheduled' || status === 'ExternalBooked') return 'bg-blue-100 text-blue-700';
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Cancelled') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('my-matches')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'my-matches' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          Trận của tôi & Lời mời
        </button>
        <button
          onClick={() => setActiveTab('pickup')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'pickup' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          Tìm đối thủ
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'create' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
        >
          Tạo kèo cá nhân
        </button>
      </div>

      {activeTab === 'my-matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiCalendar /> Lịch thi đấu của tôi
            </h2>
            {loading ? (
              <p className="text-slate-500">Đang tải...</p>
            ) : matches.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800">
                <FiActivity className="text-4xl text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Bạn chưa có trận đấu cá nhân nào.</p>
              </div>
            ) : (
              matches.map(m => (
                <div key={m.matchId} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 relative">
                  <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-lg ${getStatusColor(m.matchStatus)}`}>
                    {getStatusText(m.matchStatus)}
                  </span>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {m.sportName ? m.sportName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Kèo {m.sportName}</h3>
                      <p className="text-xs text-slate-500">{m.matchDate ? new Date(m.matchDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 items-center text-center mb-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{m.homePlayerName || 'Bạn'}</div>
                    </div>
                    <div className="font-mono flex flex-col items-center justify-center">
                      <div className="text-xl font-black text-slate-700 dark:text-slate-300">
                        {m.homeScore ?? '-'} : {m.awayScore ?? '-'}
                      </div>
                      {m.setScores && <div className="text-[10px] font-bold text-slate-500 mt-1">({m.setScores})</div>}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{m.awayPlayerName || 'Đang chờ...'}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(m.matchStatus === 'Scheduled' || m.matchStatus === 'ExternalBooked') && (
                      <button onClick={() => openScoreModal(m)} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                        <FiCheckCircle /> Hoàn thành trận đấu
                      </button>
                    )}
                    {m.matchStatus === 'Completed' && !m.isRated && (
                      <button onClick={() => handleRate(m.matchId)} className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
                        <FiStar /> Đánh giá đối thủ
                      </button>
                    )}
                    {(m.matchStatus === 'LookingForOpponent' || m.matchStatus === 'Pending') && (
                      <button onClick={async () => {
                        if(window.confirm('Hủy kèo này?')) {
                           await playerService.deleteIndividualMatch(m.matchId);
                           loadMyMatches();
                        }
                      }} className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:rose-400 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors">
                        <FiX /> Hủy kèo
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Lời mời đến bạn</h2>
            {requestsLoading ? (
              <p className="text-slate-500">Đang tải...</p>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-sm text-slate-500">Không có lời mời nào.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.requestId} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{req.requestUser?.username || 'Người chơi'}</span>
                    <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mb-3">
                    "{req.message || 'Muốn bắt kèo với bạn'}"
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(req.requestId)} className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">Chốt</button>
                    <button onClick={() => handleRejectRequest(req.requestId)} className="flex-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Từ chối</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'pickup' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Tìm theo khu vực, mô tả..." 
              className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={pickupFilters.search}
              onChange={(e) => setPickupFilters(p => ({...p, search: e.target.value}))}
            />
            <button onClick={loadPickupMatches} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2">
              <FiSearch /> Tìm
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pickupLoading ? (
              <p className="text-slate-500">Đang tải...</p>
            ) : pickupMatches.length === 0 ? (
              <div className="col-span-full text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500">Không có kèo cá nhân nào đang chờ.</p>
              </div>
            ) : (
              pickupMatches.map(m => (
                <div key={m.matchId || m.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">{m.sportName || 'Thể thao'}</div>
                    <div className="text-xs font-semibold text-slate-500"><FiClock className="inline" /> {new Date(m.createdAt || m.matchDate).toLocaleDateString()}</div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{m.homePlayerName || 'Người chơi'}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{m.description || 'Đang tìm đối thủ giao hữu'}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-slate-500">
                      <FiCalendar className="mr-2 text-emerald-500" /> 
                      {(m.matchDate || m.MatchDate) ? `${new Date(m.matchDate || m.MatchDate).toLocaleDateString('vi-VN')} ${(m.startTime || m.StartTime) ? (m.startTime || m.StartTime).substring(0,5) : ''}` : 'Chưa hẹn'}
                    </div>
                    <div className="flex items-start text-slate-500">
                      <FiMapPin className="mr-2 mt-1 text-rose-500 shrink-0" /> 
                      <LocationDisplay location={m.location || m.stadiumName} />
                    </div>
                    <div className="flex items-center text-slate-500"><FiCalendar className="mr-2 text-amber-500" /> {new Date(m.matchDate).toLocaleDateString()}</div>
                  </div>

                  <button onClick={() => handleJoin(m.matchId || m.id)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                    Xin Bắt Kèo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <CreateIndividualMatch onSuccess={() => {
          setActiveTab('my-matches');
        }} sports={sports} />
      )}

      <ScoreModal 
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        match={scoreMatch}
        onSubmit={submitScore}
        isSetFormat={scoreMatch?.sportName && (scoreMatch.sportName.toLowerCase().includes('bóng bàn') || scoreMatch.sportName.toLowerCase().includes('cầu lông') || scoreMatch.sportName.toLowerCase().includes('pickleball') || scoreMatch.sportName.toLowerCase().includes('tennis') || scoreMatch.sportName.toLowerCase().includes('quần vợt'))}
        homeName={scoreMatch?.homePlayerName || 'Bạn'}
        awayName={scoreMatch?.awayPlayerName || 'Đối thủ'}
      />
    </div>
  );
}
