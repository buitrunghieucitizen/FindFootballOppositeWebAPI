import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

export default function NotificationBell() {
  const { connection } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const tryDecode = (str) => {
    try {
      return decodeURIComponent(escape(str));
    } catch {
      return str;
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      const mapped = data.map(n => {
        const decoded = tryDecode(n.message);
        return {
          id: n.notificationId,
          title: 'Thông báo',
          message: decoded,
          details: decoded,
          date: new Date(n.createdAt),
          isRead: n.isRead,
          type: 'info'
        };
      });
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveNotification', (message) => {
        const decodedMessage = tryDecode(message);
        const newNotif = {
          id: Date.now(),
          title: 'Thông báo mới',
          message: decodedMessage,
          details: decodedMessage,
          date: new Date(),
          isRead: false,
          type: 'info'
        };
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }
  }, [connection]);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      try {
        await notificationService.markAllAsRead();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      } catch (err) {
        console.error('Lỗi khi đánh dấu đọc tất cả:', err);
      }
    }
  };

  const openDetail = async (notif) => {
    setSelectedNotif(notif);
    setShowDropdown(false);
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Lỗi markAsRead:', err);
      }
    }
  };

  return (
    <div className="relative">
      <div ref={dropdownRef}>
        <button
          onClick={handleOpenDropdown}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700 relative flex items-center justify-center"
          title="Thông báo"
        >
          <FiBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-800 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in max-h-96 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] text-emerald-500 font-medium">{unreadCount} chưa đọc</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Đánh dấu đã đọc hết
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => openDetail(notif)}
                    className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer border-l-2 ${notif.type === 'warning' ? 'border-red-400' : notif.type === 'match' ? 'border-blue-400' : 'border-emerald-400'} ${!notif.isRead ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}
                  >
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">{notif.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {notif.date.toLocaleTimeString('vi-VN')} - {notif.date.toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
            <div className={`h-2 ${selectedNotif.type === 'warning' ? 'bg-red-500' : selectedNotif.type === 'match' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-6">{selectedNotif.title}</h3>
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="absolute right-4 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-700">
                {selectedNotif.details}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
