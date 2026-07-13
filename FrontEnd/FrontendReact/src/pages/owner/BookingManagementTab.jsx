import React, { useState, useEffect, useMemo } from 'react';
import stadiumOwnerService from '../../services/stadiumOwnerService';
import { FiCheck, FiX, FiClock, FiCalendar, FiMapPin, FiList, FiGrid } from 'react-icons/fi';

export default function BookingManagementTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'schedule'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await stadiumOwnerService.getBookings();
      setBookings(Array.isArray(res.data) ? res.data : (res.data?.$values || []));
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đặt sân:', err);
      setError('Không thể tải danh sách đặt sân. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirm = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) return;
    try {
      await stadiumOwnerService.confirmBooking(id);
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi duyệt đặt sân:', err);
      alert('Không thể duyệt đặt sân. Vui lòng thử lại.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) return;
    try {
      await stadiumOwnerService.rejectBooking(id);
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi từ chối đặt sân:', err);
      alert('Không thể từ chối đặt sân. Vui lòng thử lại.');
    }
  };

  const scheduleData = useMemo(() => {
    if (viewMode !== 'schedule') return {};
    
    // Lọc theo ngày
    const filtered = bookings.filter(b => {
      if (!b.date) return false;
      const bDate = new Date(b.date).toISOString().split('T')[0];
      return bDate === selectedDate;
    });

    // Gom nhóm theo Stadium -> Pitch
    const grouped = {};
    filtered.forEach(b => {
      const stadium = b.stadiumName || 'Chưa rõ cơ sở';
      const pitch = b.pitchName || 'Sân chưa rõ';
      if (!grouped[stadium]) grouped[stadium] = {};
      if (!grouped[stadium][pitch]) grouped[stadium][pitch] = [];
      grouped[stadium][pitch].push(b);
    });

    // Sort time
    Object.keys(grouped).forEach(s => {
      Object.keys(grouped[s]).forEach(p => {
        grouped[s][p].sort((a, b) => a.startTime?.localeCompare(b.startTime || ''));
      });
    });

    return grouped;
  }, [bookings, viewMode, selectedDate]);

  if (loading) return <div className="p-6 text-center text-slate-500 dark:text-slate-400">Đang tải danh sách đặt sân...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Đặt Sân</h2>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 hover:text-slate-800 dark:hover:text-white dark:text-slate-400'}`}
          >
            <FiList /> Danh sách
          </button>
          <button 
            onClick={() => setViewMode('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'schedule' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 hover:text-slate-800 dark:hover:text-white dark:text-slate-400'}`}
          >
            <FiGrid /> Lịch trình
          </button>
        </div>
      </div>

      {viewMode === 'schedule' && (
        <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Chọn ngày xem lịch:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      {viewMode === 'schedule' ? (
        Object.keys(scheduleData).length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">Không có lịch đặt sân nào trong ngày {selectedDate}.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(scheduleData).map(stadium => (
              <div key={stadium} className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FiMapPin className="text-blue-500" /> {stadium}
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {Object.keys(scheduleData[stadium]).map(pitch => (
                    <div key={pitch}>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 pl-2 border-l-4 border-blue-500">{pitch}</h4>
                      <div className="flex flex-wrap gap-3">
                        {scheduleData[stadium][pitch].map(booking => (
                          <div key={booking.id} className={`p-3 rounded-lg border flex flex-col gap-1 min-w-[150px] ${
 (booking.status === 'Pending' || booking.status === 'Booked') ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
 booking.status === 'Confirmed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
 }`}>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"><FiClock /> {booking.startTime} - {booking.endTime}</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{booking.userName || 'Ẩn danh'}</span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${
 (booking.status === 'Pending' || booking.status === 'Booked') ? 'text-yellow-600 dark:text-yellow-500' :
 booking.status === 'Confirmed' ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'
 }`}>{(booking.status === 'Pending' || booking.status === 'Booked') ? 'Chờ duyệt' : booking.status === 'Confirmed' ? 'Đã duyệt' : booking.status}</span>
                            
                            {booking.status === 'PendingPayment' && (
                              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded border border-emerald-100 dark:border-emerald-800/30">
                                <strong>Khách cọc 30%</strong>
                                {booking.senderBankAccountNumber && (
                                  <div className="mt-1">
                                    <p>STK: <span className="font-medium text-emerald-700 dark:text-emerald-400">{booking.senderBankAccountNumber}</span></p>
                                    <p>Tên: <span className="font-medium text-emerald-700 dark:text-emerald-400">{booking.senderBankAccountName}</span></p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {(booking.status === 'Pending' || booking.status === 'Booked' || booking.status === 'PendingPayment') && (
                              <div className="flex gap-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <button onClick={() => handleConfirm(booking.id)} className="flex-1 bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600 flex justify-center">
                                  {booking.status === 'PendingPayment' ? 'Đã nhận cọc' : <FiCheck />}
                                </button>
                                <button onClick={() => handleReject(booking.id)} className="flex-1 bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600 flex justify-center"><FiX /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">Chưa có yêu cầu đặt sân nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{booking.pitchName || 'Tên sân'}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
 (booking.status === 'Pending' || booking.status === 'Booked') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
 booking.status === 'PendingPayment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
 booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
 booking.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
 }`}>
                      {(booking.status === 'Pending' || booking.status === 'Booked') ? 'Chờ duyệt' :
                       booking.status === 'PendingPayment' ? 'Chờ nhận cọc' :
                       booking.status === 'Confirmed' ? 'Đã duyệt' :
                       booking.status === 'Rejected' ? 'Từ chối' : booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2"><FiMapPin className="text-slate-400" /> Sân lớn: <span className="font-medium text-blue-600 dark:text-blue-400">{booking.stadiumName}</span></p>
                    <p className="flex items-center gap-2"><FiCalendar className="text-slate-400" /> Ngày: <span className="font-medium text-blue-600 dark:text-blue-400">{new Date(booking.date).toLocaleDateString('vi-VN')}</span></p>
                    <p className="flex items-center gap-2"><FiClock className="text-slate-400" /> Giờ: <span className="font-medium text-blue-600 dark:text-blue-400">{booking.startTime} - {booking.endTime}</span></p>
                    <p className="flex items-center gap-2">Người đặt: <span className="font-medium text-blue-600 dark:text-blue-400">{booking.userName || 'Ẩn danh'}</span></p>
                  </div>
                  {booking.status === 'PendingPayment' && (
                    <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 rounded-lg p-3">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-2">
                        <FiClock /> Khách đang đặt cọc 30%
                      </p>
                      {booking.senderBankAccountNumber ? (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <p>STK gửi: <strong className="text-slate-800 dark:text-white">{booking.senderBankAccountNumber}</strong></p>
                          <p>Người gửi: <strong className="text-slate-800 dark:text-white">{booking.senderBankAccountName}</strong></p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Khách chưa điền thông tin chuyển khoản.</p>
                      )}
                    </div>
                  )}
                </div>

                {(booking.status === 'Pending' || booking.status === 'Booked' || booking.status === 'PendingPayment') && (
                  <div className="flex gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700/50 pt-4 md:pt-0 md:pl-4 mt-2 md:mt-0">
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {booking.status === 'PendingPayment' ? 'Đã nhận cọc' : (
                        <><FiCheck /> Duyệt</>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <FiX /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
