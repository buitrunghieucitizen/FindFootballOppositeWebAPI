import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Table, Button } from '../../components';
import { FiAward, FiPlus } from 'react-icons/fi';

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTournaments(searchTerm, page);
      setTournaments(data?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])));
      if (data?.totalPages) setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiAward className="text-emerald-500" /> Quản lý Giải đấu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các giải đấu trên hệ thống</p>
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Tìm kiếm giải đấu..." className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full sm:w-56 transition-all dark:text-white dark:placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button variant="primary" className="flex items-center gap-2 rounded-xl">
            <FiPlus /> Thêm Giải Đấu
          </Button>
        </div>
      </div>

      <div className="table-wrap">
        <Table
          columns={[
            { key: 'tournamentName', label: 'Tên giải đấu', render: (name) => <span className="font-bold text-slate-800 dark:text-white">{name || 'Chưa cập nhật'}</span> },
            { key: 'startDate', label: 'Khai mạc', render: (date) => new Date(date).toLocaleDateString('vi-VN') },
            { key: 'format', label: 'Thể thức', render: (format) => format },
            { key: 'status', label: 'Trạng thái', render: (_, row) => (
              <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                row.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                row.approvalStatus === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                !row.isFeePaid && row.entryFee > 0 ? 'bg-blue-50 text-blue-600 border-blue-200' :
                row.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {row.approvalStatus === 'Pending' ? 'Chờ Duyệt' :
                 row.approvalStatus === 'Rejected' ? 'Từ chối' :
                 (!row.isFeePaid && row.entryFee > 0) ? 'Chờ Thanh Toán' :
                 row.status === 'Upcoming' ? 'Sắp diễn ra' :
                 row.status === 'InProgress' ? 'Đang diễn ra' :
                 row.status === 'Completed' ? 'Đã kết thúc' : row.status}
              </span>
            )},
            { key: 'identity', label: 'Thông tin xác thực', render: (_, row) => (
              <div className="text-xs text-slate-500">
                {row.organizerCccd ? (
                  <>
                    <div className="font-medium text-slate-700 dark:text-slate-300">CCCD: {row.organizerCccd}</div>
                    {row.organizerDriverLicense && <div>Bằng lái: {row.organizerDriverLicense}</div>}
                  </>
                ) : 'Không có'}
              </div>
            )}
          ]}
          data={tournaments}
          actions={(row) => [
            row.approvalStatus === 'Pending' && (
              <React.Fragment key={`actions-${row.tournamentId}`}>
                <Button variant="primary" size="sm" className="rounded-lg mr-2" onClick={async () => {
                  if(confirm('Bạn có chắc chắn muốn duyệt giải đấu này?')) {
                    try {
                      await adminService.approveTournament(row.tournamentId);
                      loadData();
                    } catch(e) {
                      alert('Lỗi: ' + e.message);
                    }
                  }
                }}>Duyệt</Button>
                <Button variant="danger" size="sm" className="rounded-lg mr-2" onClick={async () => {
                  if(confirm('Bạn có chắc chắn muốn từ chối giải đấu này?')) {
                    try {
                      await adminService.rejectTournament(row.tournamentId);
                      loadData();
                    } catch(e) {
                      alert('Lỗi: ' + e.message);
                    }
                  }
                }}>Từ chối</Button>
              </React.Fragment>
            ),
            <Button key="delete" variant="outline" size="sm" className="rounded-lg text-red-500 border-red-200 hover:bg-red-50" onClick={() => { if (confirm('Xóa giải đấu này?')) adminService.deleteTournament(row.tournamentId).then(() => loadData()); }}>Xóa</Button>,
          ]}
        />
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Trang {page} / {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800 text-sm flex gap-3 items-start">
          <div className="font-bold">Lưu ý:</div>
          <div>
            <p>Nếu người dùng HỦY giải đấu, hệ thống sẽ <strong>hoàn 80%</strong> số tiền đã thanh toán phí tạo giải.</p>
            <p className="mt-1"><i>Quá trình hoàn tiền hiện tại được xử lý thủ công (Manual) qua tài khoản ngân hàng của người dùng.</i></p>
          </div>
        </div>
      </div>
    </div>
  );
}
