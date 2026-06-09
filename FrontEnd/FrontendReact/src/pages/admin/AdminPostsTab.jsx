import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import { Table, Loading, Button } from '../../components';

export default function AdminPostsTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách bài viết chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Duyệt bài viết này?')) return;
    try {
      setActionLoading(true);
      await adminService.approvePost(id);
      alert('Đã duyệt bài viết');
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi duyệt bài');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Từ chối bài viết này?')) return;
    try {
      setActionLoading(true);
      await adminService.rejectPost(id);
      alert('Đã từ chối bài viết');
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi từ chối bài');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loading /></div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quản lý Bài Viết</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Phê duyệt hoặc từ chối các bài viết từ Đội trưởng</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <FiClock className="mx-auto text-4xl text-slate-300 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Không có bài viết nào đang chờ duyệt</p>
        </div>
      ) : (
        <div className="table-wrap">
          <Table
            columns={[
              { key: 'title', label: 'Tiêu đề', render: (val) => <span className="font-bold">{val}</span> },
              { key: 'postType', label: 'Loại', render: (val) => (
                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 rounded-md text-xs font-semibold">
                  {val === 'FindOpponent' ? 'Tìm kèo' : val === 'FindMember' ? 'Tìm thành viên' : 'Khác'}
                </span>
              )},
              { key: 'createdAt', label: 'Ngày tạo', render: (val) => new Date(val).toLocaleDateString('vi-VN') },
              { key: 'status', label: 'Trạng thái', render: (val) => (
                <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 rounded-md text-xs font-semibold">
                  Chờ duyệt
                </span>
              )}
            ]}
            data={posts}
            actions={(row) => [
              <button 
                key="approve"
                disabled={actionLoading}
                onClick={() => handleApprove(row.postId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
              >
                <FiCheck /> Duyệt
              </button>,
              <button 
                key="reject"
                disabled={actionLoading}
                onClick={() => handleReject(row.postId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
              >
                <FiX /> Từ chối
              </button>
            ]}
          />
        </div>
      )}
    </div>
  );
}
