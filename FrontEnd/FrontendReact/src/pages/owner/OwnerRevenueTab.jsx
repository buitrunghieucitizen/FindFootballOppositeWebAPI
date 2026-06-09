import React, { useState, useEffect, useCallback } from 'react';
import stadiumOwnerService from '../../services/stadiumOwnerService';
import { FiBarChart2, FiTrendingUp, FiActivity, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';

export default function OwnerRevenueTab() {
  const [revenueData, setRevenueData] = useState([]);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const transactions = [];

  const loadRevenue = useCallback(async (year) => {
    try {
      setLoading(true);
      const res = await stadiumOwnerService.getOwnerRevenue(year);
      let fetchedData = res.data?.data || res.data;
      if (!Array.isArray(fetchedData)) {
          fetchedData = [];
      }
      setRevenueData(fetchedData);
    } catch (e) {
      console.error(e);
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenue(revenueYear);
  }, [loadRevenue, revenueYear]);

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCommission = Math.floor(totalRevenue * 0.05); // Giả lập hoa hồng ~ 5% hoặc tính theo booking

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiBarChart2 className="text-emerald-500" />
            Báo Cáo Tài Chính & Doanh Thu
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Theo dõi doanh thu sân và các khoản phí hoa hồng nền tảng</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Năm:</label>
          <select 
            value={revenueYear}
            onChange={(e) => setRevenueYear(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold opacity-90">Tổng Doanh Thu Năm</h3>
            <div className="p-2 bg-white dark:bg-slate-800/20 rounded-lg"><FiTrendingUp /></div>
          </div>
          <div className="text-3xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalRevenue)} đ</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-600 dark:text-slate-300">Hoa Hồng Đã Trả (15k/sân)</h3>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><FiActivity /></div>
          </div>
          <div className="text-3xl font-bold text-rose-500">-{new Intl.NumberFormat('vi-VN').format(totalCommission)} đ</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-600 dark:text-slate-300">Lượt Đặt Sân Tích Lũy</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg"><FiCalendar /></div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">{Math.floor(totalRevenue / 350000)} <span className="text-lg text-slate-400">lượt</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8">Biểu Đồ Doanh Thu</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">Đang tải...</div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-2 mt-8 border-b-2 border-slate-100 dark:border-slate-700/50 pb-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-t border-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-slate-50 w-full h-full" />
              ))}
            </div>

            {revenueData.map((data, idx) => {
              const maxRev = Math.max(...revenueData.map(d => d.revenue), 1);
              const heightPercent = (data.revenue / maxRev) * 100;
              return (
                <div key={idx} className="relative flex flex-col items-center justify-end w-full h-full group">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    {new Intl.NumberFormat('vi-VN').format(data.revenue)} đ
                  </div>
                  <div 
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all duration-500 relative z-0 group-hover:from-emerald-400 group-hover:to-teal-300 shadow-sm"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  ></div>
                  <span className="absolute -bottom-7 text-xs font-bold text-slate-500 dark:text-slate-400">T{data.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Lịch Sử Giao Dịch</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã GD</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời gian</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mô tả</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Số tiền (đ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors">
                    <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-200">{txn.id}</td>
                    <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <FiClock className="text-slate-400" /> {new Date(txn.date).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-200">{txn.desc}</td>
                    <td className={`py-4 px-4 text-right font-bold text-sm ${txn.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {txn.amount > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(txn.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
