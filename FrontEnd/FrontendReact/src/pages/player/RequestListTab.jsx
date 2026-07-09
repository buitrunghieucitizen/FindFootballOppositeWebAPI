import { useState, useEffect } from 'react';
import playerService from '../../services/playerService';

export default function RequestListTab() {
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [myRes, incRes] = await Promise.all([
        playerService.getMyRequests().catch(() => ({ data: [] })),
        playerService.getIncomingRequests().catch(() => ({ data: [] }))
      ]);
      setMyRequests(myRes.data || []);
      setIncomingRequests(incRes.data || []);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách lời mời.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(true);
      if (action === 'accept') {
        await playerService.acceptInvite(requestId);
      } else {
        await playerService.rejectInvite(requestId);
      }
      loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Quản Lý Lời Mời</h2>
      
      {error && (
        <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-4 py-3 rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Requests */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b pb-2">Lời mời đến bạn</h3>
          {incomingRequests.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Không có lời mời nào.</p>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  <div>
                    <strong className="block text-slate-800 dark:text-white">{req.teamName || `Đội ${req.teamId}`}</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái: {req.status}</span>
                  </div>
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req.id, 'accept')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold rounded text-sm disabled:opacity-50"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold rounded text-sm disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 border-b pb-2">Yêu cầu bạn đã gửi</h3>
          {myRequests.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa gửi yêu cầu tham gia đội nào.</p>
          ) : (
            <div className="space-y-4">
              {myRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <div>
                    <strong className="block text-slate-800 dark:text-white">{req.teamName || `Đội ${req.teamId}`}</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Trạng thái: 
                      <span className={`ml-1 font-semibold ${
 req.status === 'Accepted' ? 'text-emerald-600' :
 req.status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'
 }`}>
                        {req.status}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
