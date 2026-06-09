import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiAward, FiCheck, FiStar, FiShield, FiX } from 'react-icons/fi';
import { paymentService } from '../../services/paymentService';

export default function CaptainPremiumTab() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (window.confirm('Bạn sẽ được chuyển hướng tới cổng thanh toán PayOS để thanh toán 120.000đ cho gói Quản Lý Đội Thể Thao (30 ngày). Bạn có đồng ý?')) {
      setIsProcessing(true);
      try {
        // Giả lập redirect qua PayOS và xử lý callback
        setTimeout(() => {
          alert('Giao dịch PayOS thành công! Cảm ơn bạn đã nâng cấp gói Quản Lý Đội.');
          setIsProcessing(false);
          window.location.reload(); // Refresh để update role
        }, 1500);
      } catch (err) {
        alert('Lỗi khi khởi tạo thanh toán PayOS!');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full mb-4">
          <FiStar className="text-4xl" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nâng cấp Gói Quản Lý Đội</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Mở khóa toàn bộ giới hạn và trải nghiệm các tính năng mạnh mẽ nhất dành cho Đội trưởng để phát triển đội bóng của bạn.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Current Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Gói Cơ Bản</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Miễn phí</div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <FiCheck className="text-emerald-500" /> Tối đa 15 thành viên
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <FiCheck className="text-emerald-500" /> Không giới hạn tạo kèo
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <FiX className="text-slate-300" /> Không có thống kê chuyên sâu
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <FiX className="text-slate-300" /> Không có công cụ quỹ đội
            </li>
          </ul>
          
          <button disabled className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 dark:text-slate-400 font-bold">
            {user?.isPremium ? 'Đã hết hạn' : 'Đang sử dụng'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            Khuyên dùng
          </div>
          
          <h3 className="text-lg font-bold text-amber-400 mb-2">Gói Chuyên Nghiệp</h3>
          <div className="text-4xl font-bold text-white mb-2">
            120.000<span className="text-lg text-slate-400">đ</span><span className="text-base text-slate-400 font-normal">/tháng</span>
          </div>
          
          <ul className="space-y-4 mb-8 mt-6">
            <li className="flex items-center gap-3 text-slate-300">
              <FiCheck className="text-amber-400" /> Không giới hạn thành viên
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <FiCheck className="text-amber-400" /> Không giới hạn tạo kèo
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <FiCheck className="text-amber-400" /> Báo cáo & Thống kê đối thủ
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <FiCheck className="text-amber-400" /> Huy hiệu Đội Uy Tín
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <FiCheck className="text-amber-400" /> Ưu tiên hiển thị tìm đối
            </li>
          </ul>
          
          {user?.isPremium ? (
            <button disabled className="w-full py-4 rounded-xl bg-white dark:bg-slate-800/10 text-white font-bold cursor-default flex items-center justify-center gap-2">
              <FiShield className="text-emerald-400" /> Đang sử dụng gói này
            </button>
          ) : (
            <button 
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 dark:text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Đang chuyển hướng PayOS...' : 'Thanh toán qua PayOS (120.000đ)'}
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
        <p>Thanh toán bảo mật trực tiếp thông qua <strong className="text-slate-700 dark:text-slate-200">cổng thanh toán PayOS</strong>.</p>
        <p>Gói sẽ hết hạn sau 30 ngày. Bạn cần mua lại nếu muốn tiếp tục sử dụng.</p>
      </div>
    </div>
  );
}
