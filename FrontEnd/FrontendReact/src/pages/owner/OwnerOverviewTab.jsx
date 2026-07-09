import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiCalendar, FiMapPin, FiActivity, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import stadiumOwnerService from '../../services/stadiumOwnerService';

export default function OwnerOverviewTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlyBookings: 0,
    monthlyRevenue: 0,
    totalStadiums: 0,
    upcomingBookings: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch bookings
      const bookingsRes = await stadiumOwnerService.getBookings();
      const bookings = bookingsRes || [];
      
      // Fetch stadiums
      const stadiumsRes = await stadiumOwnerService.getMyStadiums();
      const stadiums = stadiumsRes.data || [];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate monthly bookings
      const thisMonthBookings = bookings.filter(b => {
        if (!b.date) return false;
        const bDate = new Date(b.date);
        return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear && b.status !== 'Cancelled';
      });

      // Calculate monthly revenue (fetch from API)
      const revenueRes = await stadiumOwnerService.getOwnerRevenue(currentYear);
      const revenueData = revenueRes.data || { data: [] };
      const thisMonthRevenue = revenueData.data?.find(m => m.month === currentMonth + 1)?.revenue || 0;

      // Calculate upcoming bookings
      const upcoming = bookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
        .filter(b => new Date(b.date + 'T' + b.startTime) >= now)
        .sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime))
        .slice(0, 5);

      setStats({
        monthlyBookings: thisMonthBookings.length,
        monthlyRevenue: thisMonthRevenue,
        totalStadiums: stadiums.length,
        upcomingBookings: upcoming
      });

    } catch (error) {
      console.error("Error fetching overview data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiActivity className="text-indigo-500" /> Tổng Quan Quản Lý
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Báo cáo nhanh hoạt động kinh doanh sân bãi của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FiCheckCircle size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <FiCalendar /> <span className="font-semibold">Lượt Đặt Tháng Này</span>
            </div>
            <div className="text-4xl font-bold font-sport">{stats.monthlyBookings}</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FiDollarSign size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <FiTrendingUp /> <span className="font-semibold">Doanh Thu Tháng (VNĐ)</span>
            </div>
            <div className="text-3xl font-bold font-sport">{stats.monthlyRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FiMapPin size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
              <FiMapPin /> <span className="font-semibold">Tổng Số Sân</span>
            </div>
            <div className="text-4xl font-bold font-sport">{stats.totalStadiums}</div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiClock className="text-indigo-500" /> Lịch Đặt Sắp Tới
          </h3>
        </div>
        <div className="p-6">
          {stats.upcomingBookings.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              Chưa có lịch đặt sân sắp tới nào.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold">
                      <span className="text-xs uppercase">{new Date(booking.date).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                      <span className="text-lg leading-none">{new Date(booking.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{booking.pitchName}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <FiClock className="text-indigo-400" /> {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700 dark:text-slate-300">{booking.userName}</div>
                    <div className={`text-xs font-bold mt-1 inline-block px-2 py-1 rounded-lg ${booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {booking.status === 'Confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </div>
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
