import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FiCheckCircle, FiXCircle, FiImage, FiDownload } from 'react-icons/fi';

export default function AdminWithdrawalsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getWithdrawalRequests(filterStatus);
      setRequests(data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách rút tiền.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!receiptImage) {
      alert('Vui lòng tải lên ảnh biên lai chuyển khoản!');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('receiptImage', receiptImage);
      await adminService.approveWithdrawal(selectedRequest.requestId, formData);
      alert('Đã duyệt yêu cầu rút tiền thành công!');
      setSelectedRequest(null);
      setReceiptImage(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi duyệt.');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      try {
        await adminService.rejectWithdrawal(id);
        alert('Đã từ chối yêu cầu.');
        fetchRequests();
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi từ chối.');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Yêu cầu Rút tiền</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Duyệt lệnh rút tiền của Chủ sân</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">Tất cả</option>
          <option value="Pending">Chờ duyệt</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Rejected">Đã từ chối</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Chủ sân</th>
                <th className="p-4 font-medium">Thông tin Ngân hàng</th>
                <th className="p-4 font-medium">Số tiền</th>
                <th className="p-4 font-medium">Ngày yêu cầu</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">Đang tải...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-slate-500">Không có yêu cầu nào.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.requestId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{req.ownerName}</p>
                      <p className="text-xs text-slate-500">ID: {req.stadiumOwnerId}</p>
                    </td>
                    <td className="p-4">
                      {req.ownerBankName ? (
                        <>
                          <p className="font-medium text-slate-700 dark:text-slate-300">{req.ownerBankName}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{req.ownerBankAccount}</p>
                          <p className="text-xs text-slate-500 uppercase">{req.ownerAccountName}</p>
                        </>
                      ) : (
                        <span className="text-red-500 text-sm">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(req.amount)}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(req.requestedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'Pending' ? 'Chờ duyệt' : req.status === 'Paid' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td className="p-4">
                      {req.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors"
                            title="Duyệt"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(req.requestId)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                            title="Từ chối"
                          >
                            <FiXCircle size={18} />
                          </button>
                        </div>
                      )}
                      {req.status === 'Paid' && req.receiptImage && (
                        <a 
                          href={req.receiptImage} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                        >
                          <FiImage /> Xem biên lai
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Duyệt Yêu Cầu</h3>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleApprove} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Chủ sân</p>
                <p className="font-semibold text-slate-800 dark:text-white">{selectedRequest.ownerName}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Số tiền</p>
                <p className="font-bold text-emerald-600 text-lg">{formatCurrency(selectedRequest.amount)}</p>
              </div>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thông tin chuyển khoản:</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ngân hàng: <strong>{selectedRequest.ownerBankName}</strong></p>
                <p className="text-sm text-slate-600 dark:text-slate-400">STK: <strong>{selectedRequest.ownerBankAccount}</strong></p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Chủ TK: <strong>{selectedRequest.ownerAccountName}</strong></p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Tải lên Biên lai Chuyển khoản
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptImage(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-slate-700 dark:file:text-emerald-400"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                >
                  Xác nhận Chuyển khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
