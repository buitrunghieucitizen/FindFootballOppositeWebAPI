import apiClient from './apiClient';
import { cryptoService } from './cryptoService';
import { authService } from './authService';

export const directMessageService = {
  getConversations: async () => {
    const res = await apiClient.get('/DirectMessage/Conversations');
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;
    
    // Decrypt latest messages
    const privateKeyStr = localStorage.getItem(`privateKey_${currentUserId}`);
    for (let conv of res.data) {
      if (conv.content && conv.content.startsWith('{') && privateKeyStr) {
        try {
          const payload = JSON.parse(conv.content);
          if (payload.receiverCipher && payload.senderCipher) {
            // If current user sent the last message, decrypt senderCipher. Else receiverCipher.
            const cipherToDecrypt = conv.isSender ? payload.senderCipher : payload.receiverCipher;
            const decrypted = await cryptoService.decryptMessage(privateKeyStr, cipherToDecrypt);
            if (decrypted) conv.content = decrypted;
          }
        } catch (e) {
          // not a JSON or decryption failed, leave as is
        }
      }
    }
    return res.data;
  },

  getHistory: async (userId) => {
    const res = await apiClient.get(`/DirectMessage/History/${userId}`);
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;
    
    const privateKeyStr = localStorage.getItem(`privateKey_${currentUserId}`);
    for (let msg of res.data) {
      if (msg.content && msg.content.startsWith('{') && privateKeyStr) {
        try {
          const payload = JSON.parse(msg.content);
          if (payload.receiverCipher && payload.senderCipher) {
            const isSender = msg.senderId === parseInt(currentUserId);
            const cipherToDecrypt = isSender ? payload.senderCipher : payload.receiverCipher;
            const decrypted = await cryptoService.decryptMessage(privateKeyStr, cipherToDecrypt);
            if (decrypted) msg.content = decrypted;
          }
        } catch (e) {
          // not a JSON or decryption failed
        }
      }
    }
    return res.data;
  },

  sendMessage: async (receiverId, content) => {
    try {
      let finalContent = content;
      
      // E2EE Encryption
      const currentUser = authService.getCurrentUser();
      const senderId = currentUser ? (currentUser.id || currentUser.userId) : null;
      
      if (senderId) {
        // Fetch Receiver's Public Key
        const receiverPublicKey = await authService.getPublicKey(receiverId);
        // Fetch Sender's Public Key (or get from localStorage if we had it, but calling API is fine)
        const senderPublicKey = await authService.getPublicKey(senderId);
        
        if (receiverPublicKey && senderPublicKey) {
          const receiverCipher = await cryptoService.encryptMessage(receiverPublicKey, content);
          const senderCipher = await cryptoService.encryptMessage(senderPublicKey, content);
          
          if (receiverCipher && senderCipher) {
            finalContent = JSON.stringify({
              receiverCipher,
              senderCipher
            });
          }
        }
      }

      const response = await apiClient.post('/DirectMessage/Send', {
        receiverId,
        content: finalContent
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnreadCount: async () => {
    const res = await apiClient.get(`/DirectMessage/UnreadCount`);
    return res.data;
  }
};
