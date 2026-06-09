import React, { useState } from 'react';
import { FiAlertCircle, FiX, FiCheckCircle } from 'react-icons/fi';
import { paymentService } from '../services/paymentService';

export default function PaywallModal({ isOpen, onClose, paywallData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !paywallData) return null;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API tạo link PayOS
      const res = await paymentService.createPaymentLink({
        type: paywallData.paymentType,
        teamId: paywallData.teamId,
        pitchId: paywallData.pitchId,
        scheduleId: paywallData.scheduleId
      });

      if (res && res.checkoutUrl) {
        // Redirect to PayOS checkout page
        window.location.href = res.checkoutUrl;
      } else {
        // Fallback for mocked payment or direct success
        alert('Thanh toán (giả lập) thành công!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-700">
        <div className="relative h-32 bg-gradient-to-br from-amber-400 to-orange-500 p-6 flex flex-col justify-end">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <FiX size={24} />
          </button>
          <div className="flex items-center gap-2 text-white">
            <FiAlertCircle size={28} className="drop-shadow-md" />
            <h3 className="text-2xl font-bold drop-shadow-md">Yêu cầu thanh toán</h3>
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-500 mb-4">
              <FiCheckCircle size={32} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg mb-2">
              {paywallData.message}
            </p>
            {paywallData.amount && (
              <div className="text-3xl font-bold text-slate-900 dark:text-white my-4">
                {new Intl.NumberFormat('vi-VN').format(paywallData.amount)} VNĐ
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-800">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? 'Đang chuyển hướng...' : 'Thanh toán qua PayOS'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
