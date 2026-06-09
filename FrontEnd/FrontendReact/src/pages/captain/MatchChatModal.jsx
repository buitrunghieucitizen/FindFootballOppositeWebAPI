import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi';
import * as signalR from '@microsoft/signalr';
import { captainService } from '../../services/captainService';
import { deriveKey, encryptMessage, decryptMessage } from '../../utils/e2eeCrypto';
import { useAuth } from '../../contexts/AuthContext';

export default function MatchChatModal({ matchId, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hubConnection, setHubConnection] = useState(null);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [myTeamId, setMyTeamId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    let connection = null;

    const setupChat = async () => {
      try {
        setLoading(true);
        // 1. Fetch encrypted history
        const historyData = await captainService.getMatchChats(matchId);
        
        // 2. Fetch or Generate encryption key
        let key = localStorage.getItem(`matchKey_${matchId}`);
        if (!key) {
          // Fallback simple shared secret based on matchId for demo
          key = matchId.toString().padStart(16, '0').substring(0, 16); 
          localStorage.setItem(`matchKey_${matchId}`, key);
        }
        setCryptoKey(key);

        // Fetch My Team
        const myTeam = await captainService.getMyTeam();
        setMyTeamId(myTeam?.teamId);
        
        // Decrypt history
        const decryptedHistory = [];
        for (const msg of historyData) {
          const decText = await decryptMessage(msg.encryptedMessage, key);
          decryptedHistory.push({ ...msg, text: decText });
        }
        if (isMounted) setMessages(decryptedHistory);

        // 3. Connect to SignalR
        const token = localStorage.getItem('token');
        const hubUrl = import.meta.env.DEV ? 'https://localhost:7046/chatHub' : '/chatHub';
        connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token
          })
          .withAutomaticReconnect()
          .build();

        connection.on('ReceiveMessage', async (msg) => {
          if (!isMounted) return;
          const decText = await decryptMessage(msg.encryptedMessage, key);
          setMessages(prev => [...prev, { ...msg, text: decText }]);
        });

        await connection.start();
        await connection.invoke('JoinMatchGroup', matchId.toString());
        
        if (isMounted) {
          setHubConnection(connection);
          setLoading(false);
        } else {
          connection.stop();
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Chat setup failed:', err);
        setError('Không thể kết nối đến máy chủ chat. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      isMounted = false;
      if (connection) {
        connection.stop().catch(console.error);
      }
    };
  }, [matchId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !hubConnection || !cryptoKey) return;

    try {
      const encryptedText = await encryptMessage(newMessage, cryptoKey);
      await hubConnection.invoke('SendMessage', matchId, myTeamId, encryptedText);
      setNewMessage('');
    } catch (err) {
      console.error('Send failed:', err);
      alert('Không thể gửi tin nhắn.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm">
              <FiMessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white leading-tight">Trao đổi trước trận</h3>
              <p className="text-[11px] font-medium text-blue-600 flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div> Đang hoạt động (E2EE)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full p-2 shadow-sm transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <p className="text-slate-400 animate-pulse font-medium">Đang thiết lập kết nối an toàn...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-center p-4 h-full">
              <p className="text-rose-500 font-medium">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 my-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare className="w-8 h-8" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có tin nhắn nào.</p>
              <p className="text-xs text-slate-400 mt-2">Bắt đầu trò chuyện để thỏa thuận về sân, trang phục...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderTeamId === myTeamId;
              const showAvatar = !isMine && (idx === messages.length - 1 || messages[idx + 1]?.senderTeamId !== msg.senderTeamId);

              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isMine && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                          O
                        </div>
                      ) : <div className="w-8 h-8" />}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div className={`px-4 py-2.5 shadow-sm ${
                      isMine 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm border border-slate-200/50 dark:border-slate-700/50'
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..." 
            disabled={loading || !!error}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-0 dark:text-white text-[15px] disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || loading || !!error}
            className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:text-blue-300 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}
