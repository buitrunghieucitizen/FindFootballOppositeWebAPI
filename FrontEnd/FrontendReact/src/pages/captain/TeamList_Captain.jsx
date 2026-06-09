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
      setTeams(data || []);
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
          <h2 className="text-2xl font-bold text-gray-900">Danh sách các đội bóng</h2>
          <p className="text-sm text-gray-500 mt-1">Tìm kiếm và kết nối với các đội bóng khác trên hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.teamId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{team.teamName}</h3>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {team.sportName || 'Bóng đá'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <FiMapPin className="mr-2 text-gray-400" />
                {team.homeArea || 'Chưa cập nhật khu vực'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiShield className="mr-2 text-gray-400" />
                Trình độ: <span className="ml-1 font-medium">{team.qualityLevel || 'Chưa đánh giá'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="mr-2 text-gray-400" />
                Thành lập: {new Date(team.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>

            {team.history && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 italic">"{team.history}"</p>
            )}

            <button
              onClick={() => handleMessage(team.captainId, team.teamName)}
              disabled={team.captainId === parseInt(currentUserId)}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white transition-colors
                ${team.captainId === parseInt(currentUserId) 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}`}
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
