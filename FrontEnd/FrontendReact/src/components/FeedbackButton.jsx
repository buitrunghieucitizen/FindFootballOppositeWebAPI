import React, { useState } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      await apiClient.post('/Public/Feedback', {
        userId: user?.id || null,
        category: 'General',
        content: message.trim()
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/50 transition-all group flex items-center gap-2"
      >
        <FiMessageSquare size={24} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 font-bold text-sm">
          Góp ý
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative animate-scale-in">
            <div className="bg-indigo-600 p-6 text-white text-center relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
              <FiMessageSquare size={48} className="mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-black">Gửi Ý Kiến Đóng Góp</h3>
              <p className="text-indigo-200 mt-2 text-sm">Hãy giúp chúng tôi cải thiện SportifyX tốt hơn!</p>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8 animate-fade-in">
                  <FiCheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cảm ơn bạn!</h4>
                  <p className="text-slate-500 dark:text-slate-400">Ý kiến của bạn đã được ghi nhận vào hệ thống.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tính năng vòng bảng rất hay nhưng tôi muốn thêm..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[150px] resize-none"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><FiSend /> Gửi Phản Hồi</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
