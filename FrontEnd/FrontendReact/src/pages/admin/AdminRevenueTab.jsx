import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { FiGrid, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminRevenueTab() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('year'); // week, month, quarter, year
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (stats.length > 0) {
      setTimeout(() => setMounted(true), 100);
    } else {
      setMounted(false);
    }
  }, [stats]);

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats(timeframe);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = stats.reduce((sum, item) => sum + item.users, 0);
  const totalBookings = stats.reduce((sum, item) => sum + item.bookings, 0);
  const totalRevenue = stats.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <style>{`
        @keyframes revealRight {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        .animate-reveal-right {
          animation: revealRight 1.5s ease-out forwards;
        }
      `}</style>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiGrid className="text-emerald-500" /> Bảng Điều Khiển Chi Tiết
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê dữ liệu đa chiều của hệ thống</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button" 
            onClick={async () => {
              try {
                const res = await adminService.remindCommissionDebt();
                alert(res.message || 'Đã nhắc nhở thành công');
              } catch (e) {
                alert(e.message || 'Lỗi khi gửi thông báo nhắc nhở');
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            Nhắc nhở đóng hoa hồng
          </button>

          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200"
          >
            <option value="week">7 Ngày qua</option>
            <option value="month">Tháng này (4 tuần)</option>
            <option value="quarter">Quý này (3 tháng)</option>
            <option value="year">Năm nay (12 tháng)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-xl"><FiUsers /></div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Người dùng mới</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalUsers}</h3>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center text-xl"><FiCalendar /></div>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Lượt đặt sân</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalBookings}</h3>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-xl"><FiDollarSign /></div>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Doanh thu (VND)</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{totalRevenue.toLocaleString('vi-VN')}</h3>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Đang tải dữ liệu...</div>
      ) : stats.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Tăng trưởng Người dùng</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }} 
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      labelStyle={{ color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="users" name="Người dùng" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} isAnimationActive={mounted} animationDuration={2000} animationEasing="ease-in-out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Lượt Đặt sân</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }} 
                      itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                      labelStyle={{ color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="bookings" name="Lượt đặt sân" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" isAnimationActive={mounted} animationDuration={2000} animationEasing="ease-in-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Doanh thu</h3>
              <div className="h-80 mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" />
                        <stop offset="95%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12}}
                      tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                      formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + ' đ', 'Doanh thu']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }} 
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      labelStyle={{ color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      name="Doanh thu" 
                      fill="url(#colorAdminRevenue)" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      isAnimationActive={mounted} 
                      animationDuration={1500} 
                      animationEasing="ease-in-out" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">Bảng Số Liệu Chi Tiết</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="py-3 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Thời gian</th>
                    <th className="py-3 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Người dùng mới</th>
                    <th className="py-3 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Lượt đặt sân</th>
                    <th className="py-3 px-6 text-sm font-semibold text-slate-600 dark:text-slate-300">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {stats.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-6 text-sm text-slate-800 dark:text-white">{row.label}</td>
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{row.users}</td>
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{row.bookings}</td>
                      <td className="py-3 px-6 text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.revenue.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">Chưa có dữ liệu</div>
      )}
    </div>
  );
}
