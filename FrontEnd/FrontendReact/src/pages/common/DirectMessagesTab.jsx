import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { directMessageService } from '../../services/directMessageService';
import { cryptoService } from '../../services/cryptoService';
import { useNotification } from '../../contexts/NotificationContext';
import { FiSend, FiUser, FiClock, FiMessageSquare } from 'react-icons/fi';

export default function DirectMessagesTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { connection } = useNotification();

  useEffect(() => {
    if (!connection) return;

    const handleNewMessage = async (msg) => {
      let finalContent = msg.content;
      // Decrypt if E2EE
      if (finalContent && finalContent.startsWith('{')) {
        const privateKeyStr = localStorage.getItem(`privateKey_${user?.id || user?.userId}`);
        if (privateKeyStr) {
          try {
            const payload = JSON.parse(finalContent);
            if (payload.receiverCipher && payload.senderCipher) {
              const isSender = msg.senderId === parseInt(user?.id || user?.userId || 0);
              const cipherToDecrypt = isSender ? payload.senderCipher : payload.receiverCipher;
              const decrypted = await cryptoService.decryptMessage(privateKeyStr, cipherToDecrypt);
              if (decrypted) finalContent = decrypted;
            }
          } catch (e) {}
        }
      }
      
      const decryptedMsg = { ...msg, content: finalContent };

      setMessages(prev => {
        // If the message is for the currently selected chat, append it
        if (selectedUser && (decryptedMsg.senderId === selectedUser.userId || decryptedMsg.receiverId === selectedUser.userId)) {
          // Check for duplicates just in case
          if (!prev.find(m => m.messageId === decryptedMsg.messageId)) {
            return [...prev, decryptedMsg];
          }
        }
        return prev;
      });
      fetchConversations();
    };

    connection.on('ReceiveDirectMessage', handleNewMessage);

    return () => {
      connection.off('ReceiveDirectMessage', handleNewMessage);
    };
  }, [connection, selectedUser]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchHistory(selectedUser.userId);
      const interval = setInterval(() => fetchHistory(selectedUser.userId), 5000); // Polling current chat
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await directMessageService.getConversations();
      setConversations(data);
      if (!selectedUser && data.length > 0) {
        setSelectedUser(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (otherUserId) => {
    try {
      const data = await directMessageService.getHistory(otherUserId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const sentMsg = await directMessageService.sendMessage(selectedUser.userId, newMessage);
      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Could not send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải tin nhắn...</div>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 h-[80vh] flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tin nhắn</h2>
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500">Chưa có cuộc hội thoại nào.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map(conv => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUser(conv)}
                className={`w-full text-left px-3 py-3 mx-2 my-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-3 ${
                  selectedUser?.userId === conv.userId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <FiUser className="w-6 h-6" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{conv.fullName || 'Người dùng'}</h4>
                    <span className="text-xs text-slate-400">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-white dark:bg-slate-900">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm">
                {selectedUser.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{selectedUser.fullName}</h3>
                <p className="text-[11px] font-medium text-blue-600 flex items-center gap-1 mt-0.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Đang hoạt động</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 my-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <FiMessageSquare className="w-8 h-8" />
                  </div>
                  <p>Bắt đầu trò chuyện với {selectedUser.fullName}!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === parseInt(user?.id || user?.userId || 0);
                  const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId);
                  
                  return (
                    <div key={msg.messageId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      {!isMe && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar ? (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                              {selectedUser.fullName?.charAt(0) || 'U'}
                            </div>
                          ) : <div className="w-8 h-8" />}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                        isMe 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm border border-slate-200/50 dark:border-slate-700/50'
                      }`}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-0 dark:text-white text-[15px]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-blue-300 rounded-full transition-colors"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FiUser className="w-16 h-16 mb-4 opacity-20" />
            <p>Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
