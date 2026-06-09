import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Table, Button } from '../../components';
import { FiAward, FiPlus } from 'react-icons/fi';

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTournaments();
      setTournaments(data?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiAward className="text-emerald-500" /> Quản lý Giải đấu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các giải đấu trên hệ thống</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 rounded-xl">
          <FiPlus /> Thêm Giải Đấu
        </Button>
      </div>

      <div className="table-wrap">
        <Table
          columns={[
            { key: 'tournamentName', label: 'Tên giải đấu', render: (name) => <span className="font-bold text-slate-800 dark:text-white">{name || 'Chưa cập nhật'}</span> },
            { key: 'startDate', label: 'Ngày bắt đầu', render: (date) => new Date(date).toLocaleDateString('vi-VN') },
            { key: 'endDate', label: 'Ngày kết thúc', render: (date) => new Date(date).toLocaleDateString('vi-VN') },
            { key: 'status', label: 'Trạng thái', render: (status) => (
              <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">{status || 'Sắp diễn ra'}</span>
            )},
          ]}
          data={tournaments}
          actions={(row) => [
            <Button key="delete" variant="danger" size="sm" className="rounded-lg" onClick={() => { if (confirm('Xóa giải đấu này?')) adminService.deleteTournament(row.tournamentId).then(() => loadData()); }}>Xóa</Button>,
          ]}
        />
      </div>
    </div>
  );
}
