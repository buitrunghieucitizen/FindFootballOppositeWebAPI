import { useState, useEffect } from 'react';
import { FiMessageSquare, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/Pagination';

export default function AdminFeedbacksTab() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFeedbacks(statusFilter, page);
      setFeedbacks(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalItems || 0);
    } catch (error) {
      console.error('Lỗi tải danh sách góp ý', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminService.updateFeedbackStatus(id, newStatus);
      loadData();
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiMessageSquare className="text-indigo-500" /> Quản lý Góp ý
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng cộng: {totalItems} góp ý từ người dùng
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="New">Mới (New)</option>
            <option value="Reviewed">Đã xem (Reviewed)</option>
            <option value="Resolved">Đã xử lý (Resolved)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Đang tải dữ liệu...</div>
      ) : feedbacks.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Người gửi</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Chủ đề</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 w-1/3">Nội dung</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Ngày gửi</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {feedbacks.map((item) => (
                <tr key={item.feedbackId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">#{item.feedbackId}</td>
                  <td className="px-4 py-3">
                    {item.user ? (
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{item.user.fullName}</p>
                        <p className="text-xs text-slate-500">@{item.user.username}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Khách</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <p className="line-clamp-2">{item.content}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit
                      ${item.status === 'New' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        item.status === 'Reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}
                    >
                      {item.status === 'New' && <FiClock size={12}/>}
                      {item.status === 'Resolved' && <FiCheck size={12}/>}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === 'New' && (
                      <button 
                        onClick={() => handleUpdateStatus(item.feedbackId, 'Reviewed')}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors font-medium mr-2"
                      >
                        Đánh dấu Đã xem
                      </button>
                    )}
                    {item.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleUpdateStatus(item.feedbackId, 'Resolved')}
                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        Đánh dấu Đã xử lý
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl p-12 text-center text-slate-500">
          <FiMessageSquare className="mx-auto text-4xl text-slate-300 dark:text-slate-600 mb-3" />
          <p>Không có dữ liệu góp ý phù hợp.</p>
        </div>
      )}
    </div>
  );
}
