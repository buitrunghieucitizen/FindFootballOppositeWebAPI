import React, { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { directMessageService } from '../services/directMessageService';
import { useNotification } from '../contexts/NotificationContext';

export default function MessageBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { connection } = useNotification();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!connection) return;

    const handleNewMessage = (msg) => {
      setUnreadCount(prev => prev + 1);
    };

    connection.on('ReceiveDirectMessage', handleNewMessage);

    return () => {
      connection.off('ReceiveDirectMessage', handleNewMessage);
    };
  }, [connection]);

  const fetchUnreadCount = async () => {
    try {
      const res = await directMessageService.getUnreadCount();
      // handle either { count: x } or just a number
      const count = res.count !== undefined ? res.count : res;
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error fetching unread message count:', err);
    }
  };

  const handleClick = () => {
    // Navigate to messages tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', 'messages');
    navigate(`?${searchParams.toString()}`);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 relative flex items-center justify-center"
        title="Tin nhắn"
      >
        <FiMessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-800 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
