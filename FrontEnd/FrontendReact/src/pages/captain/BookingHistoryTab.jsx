import { useState, useEffect } from 'react';
import { captainService } from '../../services/captainService';
import { FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiClock as FiClockIcon, FiXCircle, FiInfo } from 'react-icons/fi';
import dayjs from 'dayjs';

export default function BookingHistoryTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await captainService.getBookingHistory();
      setBookings(Array.isArray(data) ? data : (data?.$values || []));
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lịch sử đặt sân.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Booked':
      case 'Confirmed':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1"><FiCheckCircle /> Đã xác nhận</span>;
      case 'PendingPayment':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1"><FiClockIcon /> Chờ thanh toán</span>;
      case 'Cancelled':
      case 'RefundRequired':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-full flex items-center gap-1"><FiXCircle /> Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full flex items-center gap-1"><FiInfo /> {status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FiCalendar className="text-emerald-500" /> Lịch sử đặt sân
        </h2>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <FiCalendar className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Bạn chưa có lịch sử đặt sân nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking.scheduleId} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20 ${booking.hasMatch ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                  {getStatusBadge(booking.scheduleStatus)}
                  <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${booking.hasMatch ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {booking.hasMatch ? 'Đặt cho trận đấu' : 'Đặt cá nhân'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                {booking.stadiumName}
              </h3>
              
              <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <FiMapPin className="text-emerald-500 shrink-0" /> 
                  <span className="truncate">{booking.pitchName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FiCalendar className="text-emerald-500 shrink-0" /> 
                  <span>{dayjs(booking.startTime).format('DD/MM/YYYY')}</span>
                </p>
                <p className="flex items-center gap-2">
                  <FiClock className="text-emerald-500 shrink-0" /> 
                  <span>{dayjs(booking.startTime).format('HH:mm')} - {dayjs(booking.endTime).format('HH:mm')}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
