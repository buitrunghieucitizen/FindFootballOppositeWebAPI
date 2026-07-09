import React, { useState, useEffect } from 'react';
import { publicService } from '../../services/publicService';
import { directMessageService } from '../../services/directMessageService';
import { useAuth } from '../../contexts/AuthContext';
import { FiMessageSquare, FiMapPin, FiShield, FiCalendar } from 'react-icons/fi';

export default function TeamList_Captain({ setActiveTab }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const currentUserId = user?.id || user?.userId;

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await publicService.getTeams();
      setTeams(data.teams ? data.teams : (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to load teams', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (captainId, teamName) => {
    try {
      // Create an initial message or just open the chat
      if (!captainId) {
        alert("Đội bóng mà bạn chọn chưa có đội trưởng để nhận tin nhắn.");
        return;
      }
      if (captainId === parseInt(currentUserId)) {
        alert("Đây là đội bóng của bạn.");
        return;
      }
      
      // Auto send a hi message
      await directMessageService.sendMessage(captainId, `Xin chào, tôi đến từ trang Danh sách đội bóng. Rất vui được biết đội ${teamName}!`);
      
      // Navigate to messages tab
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể bắt đầu cuộc trò chuyện.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Danh sách các đội bóng</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tìm kiếm và kết nối với các đội bóng khác trên hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.teamId} className="bg-white dark:bg-wc-navy-800 rounded-2xl shadow-sm border border-slate-100 dark:border-wc-navy-700 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{team.teamName}</h3>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-wc-navy-100 text-wc-navy-700 dark:bg-wc-navy-900 dark:text-wc-gold-400">
                  {team.sportName || 'Bóng đá'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <FiMapPin className="mr-2 text-slate-400" />
                {team.homeArea || 'Chưa cập nhật khu vực'}
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <FiShield className="mr-2 text-slate-400" />
                Trình độ: <span className="ml-1 font-bold text-slate-700 dark:text-slate-300">{team.qualityLevel || 'Chưa đánh giá'}</span>
              </div>
            </div>

            {team.history && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 italic">"{team.history}"</p>
            )}

            <button
              onClick={() => handleMessage(team.captainId, team.teamName)}
              disabled={team.captainId === parseInt(currentUserId)}
              className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                ${team.captainId === parseInt(currentUserId) 
                  ? 'bg-slate-100 text-slate-400 dark:bg-wc-navy-900 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-wc-gold-500 to-wc-gold-600 hover:from-wc-gold-400 hover:to-wc-gold-500 text-wc-navy-950 shadow-md shadow-wc-gold-500/20 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              <FiMessageSquare className="mr-2" />
              {team.captainId === parseInt(currentUserId) ? 'Đội của bạn' : 'Nhắn tin'}
            </button>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">Chưa có đội bóng nào trên hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
