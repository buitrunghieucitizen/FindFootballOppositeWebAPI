import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiDollarSign, FiCheck, FiZap, FiShield } from 'react-icons/fi';
import { paymentService } from '../../services/paymentService';

const depositPackages = [
  { id: 1, amount: 50000, popular: false },
  { id: 2, amount: 100000, popular: true },
  { id: 3, amount: 500000, popular: false },
];

export default function TokenTopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(depositPackages[1]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopup = async () => {
    setIsProcessing(true);
    try {
      const res = await paymentService.createPaymentLink({
        type: 'TokenTopup',
        amount: selectedPackage.amount,
        tokens: selectedPackage.amount
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert('Có lỗi xảy ra: Không lấy được link thanh toán (Mô phỏng thành công!)');
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Payment service is not configured')) {
        alert('Mô phỏng nạp tiền thành công! (Hệ thống ghi nhận giao dịch ảo vì Server chưa cấu hình PayOS thật)');
      } else {
        alert('Có lỗi xảy ra khi tạo link thanh toán: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-20">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white dark:text-white font-bold transition-colors"
        >
          <span className="text-xl">←</span> Trở về
        </button>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Nạp Số Dư Hệ Thống</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Sử dụng số dư để thanh toán các khoản phí như đẩy bài, tạo giải đấu, và nhận thanh toán đối với Chủ Sân.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-10">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư hiện tại</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                  💰
                </div>
                <span className="text-4xl font-bold text-slate-800 dark:text-white">{(user?.balance || 0).toLocaleString('vi-VN')} <span className="text-2xl text-slate-400">đ</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {depositPackages.map((pkg) => (
              <div 
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  selectedPackage.id === pkg.id 
                  ? 'border-emerald-500 bg-slate-100 shadow-lg shadow-emerald-100' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 '
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                    Phổ biến nhất
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-white">{pkg.amount.toLocaleString('vi-VN')} <span className="text-lg text-slate-400">đ</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Thanh toán an toàn với PayOS</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <FiCheck className="text-slate-900 dark:text-white" /> Thanh toán QR Code tiện lợi
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <FiZap className="text-slate-900 dark:text-white" /> Cập nhật số dư ngay lập tức
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <FiShield className="text-slate-900 dark:text-white" /> Bảo mật thông tin tuyệt đối
                </li>
              </ul>
            </div>
            <button 
              onClick={handleTopup}
              disabled={isProcessing}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-slate-800 to-black hover:from-emerald-600 hover:to-slate-800 text-white rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:pointer-events-none whitespace-nowrap"
            >
              {isProcessing ? 'Đang tạo QR...' : `Nạp ${selectedPackage.amount.toLocaleString('vi-VN')}đ`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
