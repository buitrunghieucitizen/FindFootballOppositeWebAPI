import React, { useState, useEffect, useCallback } from 'react';
import stadiumOwnerService from '../../services/stadiumOwnerService';
import { FiBarChart2, FiTrendingUp, FiActivity, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function OwnerRevenueTab() {
  const [revenueData, setRevenueData] = useState([]);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingDebt, setPendingDebt] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const loadRevenue = useCallback(async (year) => {
    try {
      setLoading(true);
      const res = await stadiumOwnerService.getOwnerRevenue(year);
      let fetchedData = res.data?.monthlyRevenue || res.data;
      if (!Array.isArray(fetchedData)) {
          fetchedData = [];
      }
      setRevenueData(fetchedData);
      setPendingDebt(res.data?.totalPendingDebt || 0);
      setTransactions(res.data?.recentTransactions || []);
    } catch (e) {
      console.error(e);
      setRevenueData([]);
      setPendingDebt(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenue(revenueYear);
  }, [loadRevenue, revenueYear]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [revenueData, loading]);

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);

  const handlePayCommission = async () => {
    try {
      setLoading(true);
      const res = await stadiumOwnerService.payCommission();
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        Swal.fire('Thành công', 'Đã thanh toán công nợ', 'success');
        loadRevenue(revenueYear);
      }
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể tạo link thanh toán: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold opacity-90">Tổng Doanh Thu Năm</h3>
            <div className="p-2 bg-white/20 rounded-lg"><FiTrendingUp /></div>
          </div>
          <div className="text-3xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalRevenue)} đ</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-600 dark:text-slate-300">Hoa Hồng Nền Tảng (5%)</h3>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><FiActivity /></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-rose-500">-{new Intl.NumberFormat('vi-VN').format(pendingDebt)} đ</div>
            {pendingDebt > 0 && (
              <button 
                onClick={handlePayCommission}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
              >
                Thanh toán
              </button>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all duration-1000 ease-out relative z-0 group-hover:from-emerald-400 group-hover:to-teal-300 shadow-sm"
                    style={{ height: mounted ? `${Math.max(heightPercent, 2)}%` : '0%' }}
                  ></div>
                  <span className="absolute -bottom-7 text-xs font-bold text-slate-500 dark:text-slate-400">T{data.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Báo Cáo Doanh Thu Theo Tháng</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">Tháng</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-right">Doanh Thu Gộp (đ)</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-right">Hoa Hồng (5%) (đ)</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-right">Thực Nhận (đ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {revenueData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                revenueData.map((data, idx) => {
                  const grossRevenue = data.revenue;
                  const commission = grossRevenue * 0.05;
                  const netRevenue = grossRevenue - commission;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-sm text-slate-800 dark:text-white">Tháng {data.month}</td>
                      <td className="py-4 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-right">{new Intl.NumberFormat('vi-VN').format(grossRevenue)} đ</td>
                      <td className="py-4 px-4 text-sm font-medium text-rose-500 text-right">-{new Intl.NumberFormat('vi-VN').format(commission)} đ</td>
                      <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{new Intl.NumberFormat('vi-VN').format(netRevenue)} đ</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
                transactions.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">#{tr.id}</td>
                    <td className="py-4 px-4 text-sm text-slate-800 dark:text-slate-300">{new Date(tr.date).toLocaleString('vi-VN')}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-800 dark:text-white">{tr.description}</td>
                    <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">+{new Intl.NumberFormat('vi-VN').format(tr.amount)} đ</td>
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
