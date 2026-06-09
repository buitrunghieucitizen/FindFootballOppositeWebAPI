import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import playerService from '../../services/playerService';
import { useAuth } from '../../contexts/AuthContext';
import { FiUserPlus, FiMapPin, FiStar, FiArrowLeft, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/portal-ui';

export default function PublicRecruitments() {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRecruitments();
  }, []);

  const fetchRecruitments = async () => {
    try {
      setLoading(true);
      const [adsData, postsData] = await Promise.all([
        publicService.getRecruitments().catch(() => []),
        publicService.getPosts().catch(() => [])
      ]);

      const formattedAds = (adsData || []).map(ad => ({
        id: `ad-${ad.adId}`,
        teamId: ad.teamId,
        title: ad.title,
        content: ad.content,
        positionNeeded: ad.positionNeeded,
        createdAt: ad.createdAt,
        teamName: ad.teamName,
        teamQuality: ad.teamQuality,
        teamHomeArea: ad.teamHomeArea,
        type: 'ad'
      }));

      const formattedPosts = (postsData || [])
        .filter(p => p.postType === 'FindMember')
        .map(p => ({
          id: `post-${p.postId}`,
          teamId: p.teamId,
          title: p.title,
          content: p.content,
          positionNeeded: 'Mọi vị trí',
          createdAt: p.createdAt,
          teamName: p.teamName || p.authorName,
          teamQuality: '',
          teamHomeArea: '',
          type: 'post'
        }));

      const merged = [...formattedAds, ...formattedPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecruitments(merged);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách tuyển quân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (teamId) => {
    if (!isAuthenticated || user.role !== 'Player') {
      window.location.href = '/login';
      return;
    }
    
    try {
      setActionLoading(true);
      await playerService.requestJoin(teamId);
      alert('Đã gửi yêu cầu ứng tuyển thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi ứng tuyển. Có thể bạn đã gửi yêu cầu trước đó.');
    } finally {
      setActionLoading(false);
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Thị Trường Chuyển Nhượng</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Tìm kiếm bến đỗ mới hoặc săn lùng những bản hợp đồng bom tấn cho đội của bạn.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse font-medium">Đang tìm kiếm các tin tuyển quân...</div>
        ) : recruitments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
              <FiUserPlus className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Hiện tại các đội thể thao đã đủ nhân sự. Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruitments.map(rec => (
              <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 text-xs font-bold rounded-lg mb-3 border border-indigo-100">
                      Tuyển: {rec.positionNeeded || 'Mọi vị trí'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold">
                      {rec.teamName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rec.teamName}</div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                        <FiStar className="mr-1 text-amber-400" /> {rec.teamQuality || 'Đang cập nhật'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <FiMapPin className="mr-1.5 text-rose-400" /> {rec.teamHomeArea || 'Chưa cập nhật khu vực'}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 flex-1">
                  {rec.content}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center text-xs text-slate-400 font-medium">
                    <FiClock className="mr-1.5" />
                    {new Date(rec.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <button 
                    onClick={() => handleApply(rec.teamId)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    Ứng tuyển ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
