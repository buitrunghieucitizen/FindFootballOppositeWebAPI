import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiActivity, FiTarget, FiPlusCircle, FiSearch, FiClock, FiFileText, FiUsers, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import playerService from '../../services/playerService';
import sportService from '../../services/sportService';
import { publicService } from '../../services/publicService';
import PaywallModal from '../../components/PaywallModal';
import Swal from 'sweetalert2';

export default function PlayerPickUpTab() {
  const [activeTab, setActiveTab] = useState('team-matches'); // 'team-matches', 'pickup-matches', 'manage', 'create'
  
  const [matchLoading, setMatchLoading] = useState(false);
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

  const [allTeamMatches, setAllTeamMatches] = useState([]);
  const [teamMatchesLoading, setTeamMatchesLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamLocation, setTeamLocation] = useState('');
  const [teamSportName, setTeamSportName] = useState('');

  const [myMatches, setMyMatches] = useState([]);
  const [myMatchesLoading, setMyMatchesLoading] = useState(false);

  useEffect(() => {
    loadSports();
    loadTeamMatches();
    loadPickupMatches();
    loadMyMatches();
  }, []);

  const loadPickupMatches = async () => {
    try {
      setPickupLoading(true);
      const res = await playerService.getPickupMatches();
      const pickupData = res.data?.data || res.data?.$values || res.data || [];
      setPickupMatches(Array.isArray(pickupData) ? pickupData : []);
    } catch (err) {
      console.error('Lỗi tải danh sách đá lẻ:', err);
    } finally {
      setPickupLoading(false);
    }
  };

  const loadTeamMatches = async () => {
    try {
      setTeamMatchesLoading(true);
      const data = await publicService.getMatches({});
      const teamData = data?.data || data?.$values || data || [];
      setAllTeamMatches(Array.isArray(teamData) ? teamData : []);
    } catch (err) {
      console.error('Lỗi tải danh sách kèo đội:', err);
    } finally {
      setTeamMatchesLoading(false);
    }
  };

  const loadMyMatches = async () => {
    try {
      setMyMatchesLoading(true);
      const res = await playerService.getMyPickupMatches();
      const myMatchesData = res.data?.data || res.data?.$values || res.data || [];
      setMyMatches(Array.isArray(myMatchesData) ? myMatchesData : []);
    } catch (err) {
      console.error('Lỗi tải kèo của tôi:', err);
    } finally {
      setMyMatchesLoading(false);
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

  const handleJoinPickup = async (postId) => {
    try {
      setJoiningId(postId);
      const res = await playerService.joinPickupMatch(postId);
      Swal.fire({
        title: 'Thành công!',
        text: res.data.message || 'Xin tham gia thành công!',
        icon: 'success',
        confirmButtonText: 'Đóng'
      });
    } catch (err) {
      if (err.response?.data?.requiresPayment) {
        setPaywallData(err.response.data);
      } else {
        Swal.fire({
          title: 'Lỗi',
          text: err.response?.data?.message || 'Có lỗi xảy ra khi xin tham gia.',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      }
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      setMatchLoading(true);
      const res = await playerService.createIndividualMatch(matchForm);
      
      Swal.fire({
        title: 'Tạo kèo thành công!',
        text: res.data.message || 'Kèo giao lưu của bạn đã được đăng lên hệ thống.',
        icon: 'success',
        confirmButtonText: 'Tuyệt vời',
        timer: 3000
      });
      
      setMatchForm({ ...matchForm, description: '', location: '', expiresAt: '' });
      loadMyMatches();
      loadPickupMatches();
      setActiveTab('manage'); // Chuyển về tab quản lý
    } catch (err) {
      Swal.fire({
        title: 'Lỗi',
        text: err.response?.data?.message || 'Lỗi tạo trận. Vui lòng thử lại.',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa kèo này?',
      text: 'Bạn sẽ không thể khôi phục lại dữ liệu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await playerService.deletePickupMatch(id);
        Swal.fire('Đã xóa!', 'Kèo của bạn đã được gỡ.', 'success');
        loadMyMatches();
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể xóa kèo. Vui lòng thử lại.', 'error');
      }
    }
  };

  // Lọc danh sách đội
  const filteredTeamMatches = allTeamMatches.filter(m => {
    const matchSearch = teamSearch.toLowerCase();
    const matchLoc = teamLocation.toLowerCase();
    
    const matchesName = !matchSearch || (m.homeTeamName && m.homeTeamName.toLowerCase().includes(matchSearch)) || (m.sportName && m.sportName.toLowerCase().includes(matchSearch));
    const matchesLocation = !matchLoc || (m.location && m.location.toLowerCase().includes(matchLoc)) || (m.stadiumName && m.stadiumName.toLowerCase().includes(matchLoc));
    const matchesSport = !teamSportName || (m.sportName && m.sportName === teamSportName);
    
    return matchesName && matchesLocation && matchesSport;
  });

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* ── Gradient Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-700 dark:via-teal-600 dark:to-cyan-600 p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FiActivity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-sport text-xl sm:text-3xl font-bold text-white tracking-tight uppercase">Gạ Kèo & Bắt Đối</h1>
              <p className="text-emerald-50 text-sm mt-1">Giao lưu thể thao cá nhân và tìm đối thủ cho Đội.</p>
            </div>
          </div>
          
          {/* Nút Tạo Kèo Lớn */}
          {activeTab !== 'create' && (
            <button 
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <FiPlusCircle size={20} /> Tạo Kèo Cá Nhân
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      {activeTab !== 'create' && (
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('team-matches')}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'team-matches' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <FiUsers /> Kèo Giao Hữu
          </button>
          <button
            onClick={() => setActiveTab('pickup-matches')}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pickup-matches' 
                ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <FiTarget /> Xin Đá Ké
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manage' 
                ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <FiCheckCircle /> Kèo Đã Tạo
          </button>
        </div>
      )}

      {/* ── VIEW: TEAM MATCHES ── */}
      {activeTab === 'team-matches' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-sport text-xl font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
              Danh Sách Chờ Khách
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <select
                value={teamSportName}
                onChange={e => setTeamSportName(e.target.value)}
                className="py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <option value="">Tất cả môn</option>
                {sports.map(s => (
                  <option key={s.sportId} value={s.sportName}>{s.sportName}</option>
                ))}
              </select>
              <div className="relative w-full sm:w-56">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm tên đội..." 
                  value={teamSearch}
                  onChange={e => setTeamSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full outline-none transition-all"
                />
              </div>
              <div className="relative w-full sm:w-48">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Lọc khu vực..." 
                  value={teamLocation}
                  onChange={e => setTeamLocation(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {teamMatchesLoading ? (
              <div className="flex justify-center h-32 items-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
              </div>
            ) : filteredTeamMatches.length === 0 ? (
              <div className="text-center text-slate-500 py-12">Không tìm thấy trận giao hữu đội nào phù hợp.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTeamMatches.map(match => (
                  <div key={match.id || match.matchId} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col h-full bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                      <span 
                        className={`font-bold text-slate-800 dark:text-white text-lg flex-1 truncate group-hover:text-blue-600 transition-colors ${match.matchType === 'PickUp' ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={() => {
                          if (match.matchType === 'PickUp') {
                            Swal.fire({
                              title: 'Thông tin người tạo',
                              html: `
                                <div class="flex flex-col items-center">
                                  <img src="${match.homeTeamAvatar || 'https://via.placeholder.com/100'}" class="w-24 h-24 rounded-full mb-4 object-cover border-4 border-slate-100 shadow-sm" />
                                  <h3 class="font-bold text-xl mb-1">${match.homeTeamName || 'Người chơi ẩn'}</h3>
                                  <p class="text-slate-500 font-medium">SĐT: ${match.homeTeamPhone || 'Không công khai'}</p>
                                </div>
                              `,
                              confirmButtonText: 'Đóng',
                              confirmButtonColor: '#4f46e5'
                            });
                          }
                        }}
                        title={match.matchType === 'PickUp' ? "Nhấn để xem thông tin cá nhân" : ""}
                      >
                        {match.homeTeamName || 'Đội Ẩn Danh'}
                      </span>
                      <span className="text-xs font-bold px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg shrink-0">
                        {match.sportName || 'Thể thao'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-auto text-sm text-slate-600 dark:text-slate-400">
                      <p className="flex items-center gap-3">
                        <FiCalendar className="text-slate-400" />
                        {match.matchDate ? new Date(match.matchDate).toLocaleDateString('vi-VN') : 'Đang xếp'} {match.startTime && ` • ${match.startTime}`}
                      </p>
                      <p className="flex items-center gap-3">
                        <FiMapPin className="text-slate-400" />
                        <span className="truncate">{match.stadiumName || match.location || 'Chưa chốt sân'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: PICKUP MATCHES ── */}
      {activeTab === 'pickup-matches' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="font-sport text-xl font-bold text-slate-800 dark:text-white uppercase">Tìm Trận Đang Thiếu Người</h3>
          </div>

          <div className="p-6">
            {pickupLoading ? (
              <div className="flex justify-center h-32 items-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
              </div>
            ) : pickupMatches.length === 0 ? (
              <div className="text-center text-slate-500 py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <FiTarget className="text-3xl mx-auto mb-2 text-slate-300" />
                <p>Hiện không có trận cá nhân nào đang cần người.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pickupMatches.map(post => (
                  <div key={post.postId} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-800 dark:text-white">{post.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{post.content}</p>
                      <div className="flex gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                          <FiTarget /> {post.match?.sport?.sportName || 'Thể thao'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-xs font-bold">
                          <FiClock /> {post.match?.expiresAt ? new Date(post.match.expiresAt).toLocaleDateString('vi-VN') : 'Sắp tới'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleJoinPickup(post.postId)}
                      disabled={joiningId === post.postId}
                      className="w-full md:w-auto px-6 py-2.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-500 hover:text-white transition-all disabled:opacity-50 border border-teal-100 dark:border-teal-800/50"
                    >
                      {joiningId === post.postId ? 'Đang gửi...' : 'Xin Đá Ké'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: MANAGE MATCHES ── */}
      {activeTab === 'manage' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
            <h3 className="font-sport text-xl font-bold text-slate-800 dark:text-white uppercase">Quản Lý Kèo Đã Tạo</h3>
          </div>

          <div className="p-6">
            {myMatchesLoading ? (
              <div className="flex justify-center h-32 items-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-500 animate-spin" />
              </div>
            ) : myMatches.length === 0 ? (
              <div className="text-center text-slate-500 py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <FiCheckCircle className="text-3xl mx-auto mb-2 text-slate-300" />
                <p>Bạn chưa tạo kèo cá nhân nào.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myMatches.map(match => {
                  let info = {};
                  try { if(match.cancelReason) info = JSON.parse(match.cancelReason); } catch(e){}

                  return (
                    <div key={match.matchId} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${match.matchStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {match.matchStatus}
                          </span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            ID: #{match.matchId}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-2">
                          <FiMapPin /> {info.Location || 'Chưa rõ địa điểm'}
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                          <FiClock /> Hết hạn: {match.expiresAt ? new Date(match.expiresAt).toLocaleString('vi-VN') : ''}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteMatch(match.matchId)}
                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        title="Hủy kèo"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW: CREATE MATCH ── */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
            <h3 className="font-sport text-xl font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
              <FiPlusCircle className="text-emerald-500" /> Tạo Kèo Mới
            </h3>
            <button 
              onClick={() => setActiveTab('team-matches')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleCreateMatch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiActivity className="text-emerald-500" /> Môn Thể Thao
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    value={matchForm.sportId}
                    onChange={e => setMatchForm({ ...matchForm, sportId: Number(e.target.value) })}
                  >
                    {sports.map(s => (
                      <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiTarget className="text-emerald-500" /> Trình Độ Mong Muốn
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
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
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiMapPin className="text-emerald-500" /> Địa Điểm (Dự Kiến)
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: Sân Chùa Láng, Đống Đa"
                    value={matchForm.location}
                    onChange={e => setMatchForm({...matchForm, location: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FiCalendar className="text-emerald-500" /> Ngày Diễn Ra
                    </label>
                    <input 
                      type="date" 
                      required
                      value={matchForm.expiresAt ? matchForm.expiresAt.split('T')[0] : ''}
                      onChange={e => {
                        const timePart = (matchForm.expiresAt && matchForm.expiresAt.includes('T')) ? matchForm.expiresAt.split('T')[1] : '00:00';
                        setMatchForm({...matchForm, expiresAt: `${e.target.value}T${timePart}`});
                      }}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FiClock className="text-emerald-500" /> Giờ Diễn Ra
                    </label>
                    <input 
                      type="time" 
                      required
                      value={matchForm.expiresAt && matchForm.expiresAt.includes('T') ? matchForm.expiresAt.split('T')[1] : ''}
                      onChange={e => {
                        const datePart = (matchForm.expiresAt && matchForm.expiresAt.includes('T')) ? matchForm.expiresAt.split('T')[0] : new Date().toISOString().split('T')[0];
                        setMatchForm({...matchForm, expiresAt: `${datePart}T${e.target.value}`});
                      }}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiFileText className="text-emerald-500" /> Ghi Chú & Thể Thức
                </label>
                <textarea 
                  rows="3"
                  required
                  placeholder="VD: Giao lưu vui vẻ, chia tiền sân 50/50, cần tìm 2 bạn đá cánh..."
                  value={matchForm.description}
                  onChange={e => setMatchForm({...matchForm, description: e.target.value})}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveTab('team-matches')}
                  className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={matchLoading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {matchLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Xác Nhận Đăng Kèo <FiCheckCircle /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PaywallModal 
        isOpen={!!paywallData} 
        onClose={() => setPaywallData(null)} 
        paywallData={paywallData} 
      />
    </div>
  );
}
