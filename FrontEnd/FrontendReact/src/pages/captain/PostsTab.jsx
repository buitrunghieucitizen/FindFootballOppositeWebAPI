import React, { useState, useEffect, useRef } from 'react';
import { captainService } from '../../services/captainService';
import { FiMessageSquare, FiImage, FiPlus, FiX } from 'react-icons/fi';

export default function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('FindOpponent');
  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [homeArea, setHomeArea] = useState('');
  const [qualityLevel, setQualityLevel] = useState('');
  const [positionNeeded, setPositionNeeded] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await captainService.getPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await captainService.uploadMedia(formData);
      if (response && response.url) {
        setImageUrls(prev => [...prev, response.url]);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Lỗi tải ảnh lên');
    } finally {
      setUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let finalContent = content;
    if (postType === 'FindOpponent') {
      const extraInfo = [];
      if (homeArea) extraInfo.push(`📍 Khu vực: ${homeArea}`);
      if (qualityLevel) extraInfo.push(`⭐ Trình độ: ${qualityLevel}`);
      if (extraInfo.length > 0) {
        finalContent = `${extraInfo.join('\n')}\n\n${content}`;
      }
    }

    try {
      setSubmitting(true);
      if (postType === 'FindMember') {
        await captainService.createRecruitment({
          title,
          content,
          positionNeeded
        });
      } else {
        await captainService.createPost({
          title,
          content: finalContent,
          postType,
          imageUrls: imageUrls.join(',')
        });
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setHomeArea('');
      setQualityLevel('');
      setPositionNeeded('');
      setImageUrls([]);
      setPostType('FindOpponent');
      setShowForm(false);
      
      // Refresh list
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đăng bài');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuffPost = async (postId) => {
    if (window.confirm('Bạn có muốn đẩy bài viết này lên trang chủ với phí 10.000đ (trừ vào số dư)?')) {
      try {
        // Gọi API buff bài (hiện tại giả lập thành công)
        // await captainService.buffPost(postId);
        alert('Đã trừ 10.000đ. Bài viết của bạn đã được đẩy lên TOP 1 ưu tiên!');
      } catch (err) {
        alert('Số dư không đủ hoặc có lỗi xảy ra');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Cộng Đồng & Tuyển Dụng</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/30 font-medium"
        >
          {showForm ? <><FiX /> Hủy</> : <><FiPlus /> Đăng bài</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700/60 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tiêu đề</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Loại bài viết</label>
              <select
                value={postType}
                onChange={e => setPostType(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="FindOpponent">Tìm đối thủ (Bắt kèo)</option>
                <option value="FindMember">Tuyển quân (Tìm thành viên)</option>
                <option value="FindStadium">Tìm sân</option>
                <option value="General">Thảo luận chung</option>
              </select>
            </div>

            {(postType === 'FindOpponent' || postType === 'FindStadium') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phạm vi / Khu vực</label>
                  <input
                    type="text"
                    value={homeArea}
                    onChange={e => setHomeArea(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="VD: Cầu Giấy, Hà Nội"
                  />
                </div>
                {postType === 'FindOpponent' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Trình độ mong muốn</label>
                  <select
                    value={qualityLevel}
                    onChange={e => setQualityLevel(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                  >
                    <option value="">-- Chọn trình độ --</option>
                    <option value="Mới chơi">Mới chơi</option>
                    <option value="Trung bình yếu">Trung bình yếu</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Trung bình khá">Trung bình khá</option>
                    <option value="Khá">Khá</option>
                    <option value="Mạnh">Mạnh</option>
                  </select>
                </div>
                )}
              </div>
            )}

            {postType === 'FindMember' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Vị trí cần tuyển</label>
                <input
                  type="text"
                  value={positionNeeded}
                  onChange={e => setPositionNeeded(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="VD: Tiền đạo, Hậu vệ, Thủ môn..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nội dung</label>
              <textarea
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Mô tả chi tiết nội dung bài viết..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Hình ảnh</label>
              <div className="flex flex-wrap gap-4 mb-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={url} alt="upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
                >
                  <FiImage size={24} className="mb-1" />
                  <span className="text-xs">{uploadingImage ? 'Đang tải...' : 'Thêm ảnh'}</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Đang tải...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 shadow-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
          <p className="text-slate-500 dark:text-slate-400">Hãy đăng bài để tìm đối thủ hoặc thành viên mới cho đội của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id || Math.random()} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{post.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs rounded-md font-medium">
                      {post.postType === 'FindOpponent' ? 'Tìm đối thủ' : 
                       post.postType === 'FindMember' ? 'Tìm thành viên' : 'Thảo luận'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleBuffPost(post.id || Math.random())} className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-1">
                  Đẩy tin (10k)
                </button>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4">{post.content}</p>
              
              {post.imageUrls && typeof post.imageUrls === 'string' && post.imageUrls.split(',').filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.imageUrls.split(',').filter(Boolean).map((url, idx) => (
                    <img key={idx} src={url.trim()} alt={`Post img ${idx}`} className="w-32 h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
