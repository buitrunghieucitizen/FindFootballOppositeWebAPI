import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiPlus, FiFilter, FiUser, FiClock, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import postService from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PublicLayout } from '../components/portal-ui';
import Pagination from '../components/Pagination';

export default function CommunityFeed() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', postType: 'Recruitment', imageUrls: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getPosts(filterType, page);
      setPosts(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      console.error('Lỗi tải bài viết', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filterType, page]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) return alert('Bạn cần đăng nhập để đăng bài!');
    
    setSubmitting(true);
    try {
      await postService.createPost(newPost);
      alert('Đăng bài thành công!');
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', postType: 'Recruitment', imageUrls: '' });
      loadPosts();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi đăng bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await postService.deletePost(id);
      loadPosts();
    } catch (error) {
      console.error(error);
      alert('Lỗi xóa bài viết');
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'Recruitment': return { label: 'Tuyển quân', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'Challenge': return { label: 'Gạ kèo', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
      case 'Advertisement': return { label: 'Quảng cáo', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'News': return { label: 'Thông báo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      default: return { label: type, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <PublicLayout 
      title="Cộng Đồng SportifyX"
      subtitle="Tìm đội, gạ kèo, chia sẻ quảng cáo hoặc theo dõi thông báo mới nhất từ ban quản trị."
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div></div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tất cả bài viết</option>
                <option value="Recruitment">Tuyển quân</option>
                <option value="Challenge">Gạ kèo</option>
                <option value="News">Thông báo Admin</option>
                <option value="Advertisement">Quảng cáo</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-500/20"
            >
              <FiPlus /> Viết Bài
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Đang tải bảng tin...</div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => {
              const typeInfo = getPostTypeLabel(post.postType);
              const isOwnerOrAdmin = user && (user.userId === post.author?.userId || user.role === 'Admin');

              return (
                <div key={post.postId} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${(index % 10) * 50}ms`, animationFillMode: 'both' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                        <FiUser size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {post.author?.fullName || 'Người dùng ẩn danh'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>@{post.author?.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><FiClock /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {isOwnerOrAdmin && (
                        <button 
                          onClick={() => handleDeletePost(post.postId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          title="Xóa bài"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{post.title}</h2>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.imageUrls && (
                    <div className="mt-4 rounded-xl overflow-hidden max-h-96 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      <img src={post.imageUrls} alt="Post image" className="max-h-96 object-contain" />
                    </div>
                  )}
                  
                  {post.team && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Đội: <span className="text-emerald-600 dark:text-emerald-400">{post.team.teamName}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl p-12 text-center text-slate-500">
              <FiMessageSquare className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Chưa có bài viết nào</p>
              <p className="text-sm mt-1">Hãy là người đầu tiên đăng bài trong mục này!</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Viết Bài Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Loại bài viết</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newPost.postType}
                  onChange={e => setNewPost({...newPost, postType: e.target.value})}
                  required
                >
                  <option value="Recruitment">Tuyển quân</option>
                  <option value="Challenge">Gạ kèo</option>
                  <option value="Advertisement">Quảng cáo</option>
                  {user?.role === 'Admin' && <option value="News">Thông báo Admin</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tiêu đề</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nội dung</label>
                <textarea 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                  placeholder="Viết nội dung ở đây..."
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-70 flex items-center gap-2">
                  {submitting ? 'Đang đăng...' : <><FiMessageSquare /> Đăng Bài</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
