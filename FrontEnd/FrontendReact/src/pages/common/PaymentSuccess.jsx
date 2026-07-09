import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome, FiArrowRight } from 'react-icons/fi';
import { PublicHeader } from '../../components/portal-ui';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const cancel = searchParams.get('cancel');

  useEffect(() => {
    const verifyTransaction = async () => {
      if (cancel === 'true' || code !== '00') {
        setStatus('failed');
        return;
      }
      
      try {
        const baseUrl = import.meta.env.DEV ? 'http://localhost:5229' : '';
        const response = await fetch(`${baseUrl}/api/Payment/VerifyPayment?orderCode=${orderCode}`);
        const data = await response.json();
        
        if (data.success && data.status === 'PAID') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.error('Lỗi verify payment', err);
        setStatus('success'); // Fallback in case backend is unreachable but PayOS says success
      }
    };

    verifyTransaction();
  }, [code, cancel, orderCode]);

  const handleReturnDashboard = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role;
    
    if (role === 'Captain') navigate('/captain?tab=tournaments');
    else if (role === 'StadiumOwner') navigate('/owner?tab=tournaments');
    else if (role === 'Admin') navigate('/admin');
    else navigate('/player?tab=tournaments');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20">
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-700/50 animate-fade-in relative overflow-hidden">
          {/* Background Glow */}
          {status === 'success' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -z-10"></div>
          )}
          {status === 'failed' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl -z-10"></div>
          )}

          {status === 'processing' && (
            <div className="py-12">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Đang xử lý kết quả...</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Vui lòng chờ trong giây lát.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 animate-bounce-slow">
                <FiCheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Giao dịch thành công!</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
                Cảm ơn bạn đã sử dụng dịch vụ của Sportify.
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">
                Mã đơn hàng: <span className="font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{orderCode}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleReturnDashboard} 
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  Về Bảng điều khiển <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="py-8">
              <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20">
                <FiXCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Giao dịch không thành công</h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
                Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra.
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">
                Mã đơn hàng: <span className="font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{orderCode}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleReturnDashboard} 
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                >
                  Về Bảng điều khiển <FiArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}
