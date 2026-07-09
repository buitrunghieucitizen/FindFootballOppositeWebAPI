import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import { directMessageService } from '../../services/directMessageService';
import { FiMapPin, FiPhone, FiStar, FiArrowLeft, FiInfo, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/portal-ui';

export default function PublicStadiums() {
  const [stadiums, setStadiums] = useState([]);
  const [sports, setSports] = useState([]);
  const [filters, setFilters] = useState({ search: '', sportId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    fetchStadiums();
  }, [filters.sportId]);

  const fetchSports = async () => {
    try {
      const data = await publicService.getSports();
      const sportsData = data?.data || data?.$values || data || [];
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStadiums = async () => {
    try {
      setLoading(true);
      const data = await publicService.getStadiums(filters);
      setStadiums(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách sân thể thao. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatOwner = async (ownerId) => {
    if (!ownerId) {
      alert('Không tìm thấy thông tin chủ sân.');
      return;
    }
    try {
      if (!localStorage.getItem('token')) {
        alert('Vui lòng đăng nhập để chat với chủ sân!');
        return;
      }
      await directMessageService.sendMessage(ownerId, "Xin chào chủ sân, tôi muốn hỏi thông tin về sân này.");
      alert('Đã gửi tin nhắn tự động. Vui lòng vào trang Tin Nhắn trên Dashboard của bạn để xem phản hồi.');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi tin nhắn!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 dark:bg-slate-950 font-sans">
      <PublicHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white dark:text-white font-medium mb-4 transition-colors">
              <FiArrowLeft className="mr-2" /> Quay lại trang chủ
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Hệ Thống sân thể thao</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Khám phá các cụm sân chất lượng cao và đặt lịch nhanh chóng.</p>
          </div>
          
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-3 bg-gradient-to-r from-slate-800 to-black text-white font-bold rounded-xl hover:from-emerald-600 hover:to-slate-800 transition-all shadow-lg hover:shadow-emerald-500/25">
              Đăng ký làm Chủ Sân
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm sân theo tên, địa chỉ..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={filters.sportId}
            onChange={(e) => setFilters(prev => ({...prev, sportId: e.target.value}))}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
          >
            <option value="">Tất cả môn thể thao</option>
            {sports.map(s => (
              <option key={s.sportId} value={s.sportId}>{s.sportName}</option>
            ))}
          </select>
          <button
            onClick={() => fetchStadiums()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl mb-8 flex items-center">
            <FiInfo className="mr-3 text-rose-500 text-xl" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 h-48 bg-slate-200 rounded-2xl"></div>
                <div className="flex-1 py-2">
                  <div className="w-3/4 h-6 bg-slate-200 rounded-md mb-4"></div>
                  <div className="w-full h-4 bg-slate-200 rounded-md mb-2"></div>
                  <div className="w-2/3 h-4 bg-slate-200 rounded-md mb-6"></div>
                  <div className="flex gap-2">
                    <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stadiums.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
              <FiMapPin className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có sân thể thao nào</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Hệ thống đang cập nhật danh sách sân thể thao. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stadiums.map(stadium => (
              <div 
                key={stadium.stadiumId} 
                onClick={() => setSelectedStadium(stadium)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 border border-slate-100 dark:border-slate-700 hover:border-emerald-100 transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer"
              >
                
                <div className="w-full sm:w-2/5 h-56 sm:h-auto bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden flex-shrink-0">
                  {stadium.imageUrl ? (
                    <img src={stadium.imageUrl} alt={stadium.stadiumName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/20 group-hover:opacity-0 transition-opacity duration-300"></div>
                      <div className="w-full h-full flex items-center justify-center text-emerald-500">
                        <FiMapPin className="w-16 h-16 opacity-30 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:hover:text-white dark:text-slate-200 transition-colors line-clamp-1">
                      {stadium.stadiumName}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {stadium.sports && stadium.sports.map((sport, index) => (
                          <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded border border-slate-200 dark:border-slate-700">
                            {sport}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-start text-slate-600 dark:text-slate-400 text-sm">
                        <FiMapPin className="mr-2 mt-1 text-rose-400 flex-shrink-0" />
                        <span className="line-clamp-2">{stadium.address || 'Chưa cập nhật địa chỉ'}</span>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                        <FiPhone className="mr-2 text-emerald-500" />
                        <span>{stadium.hotline || 'Chưa có SĐT'}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {stadium.description || 'Sân thể thao chất lượng cao, trang thiết bị hiện đại phục vụ anh em đam mê bóng đá.'}
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Các loại sân</span>
                      <div className="flex flex-wrap gap-2">
                        {stadium.pitches && stadium.pitches.length > 0 ? (
                          stadium.pitches.slice(0, 3).map((pitch, idx) => (
                            <span key={pitch.pitchId || idx} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                              Sân {pitch.pitchSize}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có thông tin sân con</span>
                        )}
                        {stadium.pitches && stadium.pitches.length > 3 && (
                          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                            +{stadium.pitches.length - 3} nữa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/login" 
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex justify-center items-center py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md mt-2 w-full sm:w-auto"
                  >
                    Đặt sân ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Stadium Detail Modal */}
      {selectedStadium && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-6">
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedStadium.stadiumName}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStadium.sports && selectedStadium.sports.map((sport, index) => (
                      <span key={index} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStadium(null)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white p-2"
                >
                  ✕
                </button>
              </div>

              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <FiMapPin className="w-20 h-20 text-emerald-500 opacity-20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                      <FiMapPin size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Địa chỉ</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                        {selectedStadium.address || 'Chưa cập nhật địa chỉ'}
                      </div>
                      {selectedStadium.latitude && selectedStadium.longitude && (
                        <a 
                          href={`https://maps.google.com/?q=${selectedStadium.latitude},${selectedStadium.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                        >
                          <FiMapPin /> Xem trên Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <FiPhone size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Hotline liên hệ</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {selectedStadium.hotline || 'Chưa có SĐT'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Thông tin chi tiết</h4>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedStadium.description || 'Sân thể thao chất lượng cao, trang thiết bị hiện đại phục vụ anh em đam mê bóng đá.'}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Danh sách sân ({selectedStadium.pitches?.length || 0})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedStadium.pitches && selectedStadium.pitches.length > 0 ? (
                    selectedStadium.pitches.map((pitch, idx) => (
                      <div key={pitch.pitchId || idx} className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:border-emerald-300 transition-colors cursor-default">
                        <div className="font-bold text-slate-900 dark:text-white mb-1">{pitch.pitchName || `Sân ${pitch.pitchSize || pitch.grassType}`}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Sân {pitch.pitchSize || pitch.grassType} người</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm">
                      Chưa có thông tin sân con
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => handleChatOwner(selectedStadium.ownerId)}
                className="px-6 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
              >
                <FiMessageSquare />
                Liên hệ chủ sân
              </button>
              <button 
                onClick={() => setSelectedStadium(null)}
                className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors shadow-sm"
              >
                Đóng
              </button>
              <Link 
                to="/login"
                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Đặt sân ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

