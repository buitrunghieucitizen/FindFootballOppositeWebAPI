import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiExternalLink, FiX } from 'react-icons/fi';

export default function SurveyPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show for specific roles
    if (!user || !['Player', 'Captain', 'StadiumOwner'].includes(user.role)) {
      return;
    }

    const hasTakenSurvey = localStorage.getItem('hasTakenSurvey');
    const surveySkippedSession = sessionStorage.getItem('surveySkippedSession');
    
    if (!hasTakenSurvey && !surveySkippedSession) {
      // Delay slightly for better UX
      const timer = setTimeout(() => {
        setShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleTakeSurvey = () => {
    localStorage.setItem('hasTakenSurvey', 'true');
    setShow(false);
    window.open('https://forms.gle/5bPJyx5qh2zgvKpj6', '_blank');
  };

  const handleSkip = () => {
    // Hide for this session if skipped, but show again next login
    sessionStorage.setItem('surveySkippedSession', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-wc-navy-900 border border-wc-navy-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-full p-2 transition-all"
        >
          <FiX size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 bg-wc-gold-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📝</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Khảo sát chất lượng 
          </h2>
          
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Chúng tôi đang nỗ lực cải thiện trải nghiệm của hệ thống. Xin hãy dành chút thời gian để làm khảo sát nhé! Ý kiến của bạn rất quan trọng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-semibold text-sm"
            >
              Bỏ qua lần này
            </button>
            <button
              onClick={handleTakeSurvey}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-wc-gold-500 to-amber-500 text-wc-navy-950 hover:from-wc-gold-400 hover:to-amber-400 transition-all font-bold text-sm shadow-lg shadow-wc-gold-500/20"
            >
              Tới link khảo sát
              <FiExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
