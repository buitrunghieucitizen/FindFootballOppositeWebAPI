import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cryptoService } from '../services/cryptoService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        
        // Extract userId from token
        let userId = null;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub;
        } catch (e) {
          console.warn("Could not parse token payload", e);
        }

        parsed.id = userId;
        parsed.userId = userId;
        parsed.isPremium = true; // UNLOCK ALL PREMIUM FEATURES FOR TESTING
        setUser(parsed);
        
        // E2EE Setup
        if (userId) {
          setupE2EEKeys(userId);
        }
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const extractUserId = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub;
    } catch (e) {
      return null;
    }
  };

  const setupE2EEKeys = async (userId) => {
    try {
      const privateKeyStr = localStorage.getItem(`privateKey_${userId}`);
      if (!privateKeyStr) {
        // Generate new key pair
        const keyPair = await cryptoService.generateKeyPair();
        const publicKeyBase64 = await cryptoService.exportPublicKey(keyPair.publicKey);
        const privateKeyBase64 = await cryptoService.exportPrivateKey(keyPair.privateKey);
        
        // Save private key locally
        localStorage.setItem(`privateKey_${userId}`, privateKeyBase64);
        
        // Upload public key to server
        await authService.updatePublicKey(publicKeyBase64);
        console.log("Đã tạo và đồng bộ E2EE PublicKey");
      }
    } catch (err) {
      console.error("Lỗi setup E2EE", err);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(username, password);
      if (response.requires2FA || response.requiresSetup2FA) {
        return response;
      }
      const userId = extractUserId(response.token);
      setUser({
        id: userId,
        userId: userId,
        username: response.username,
        role: response.role,
        isPremium: response.isPremium,
        balance: response.balance || 0
      });
      if (userId) setupE2EEKeys(userId);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (username, password, code) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.verify2FA(username, password, code);
      const userId = extractUserId(response.token);
      setUser({
        id: userId,
        userId: userId,
        username: response.username,
        role: response.role,
        isPremium: response.isPremium,
        balance: response.balance || 0
      });
      if (userId) setupE2EEKeys(userId);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Xác thực 2FA thất bại';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async (username, password) => {
    return await authService.setup2FA(username, password);
  };

  const register = async (username, fullName, phone, password, confirmPassword, userRole) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(
        username,
        fullName,
        phone,
        password,
        confirmPassword,
        userRole
      );
      if (response.token) {
        const userId = extractUserId(response.token);
        setUser({
          id: userId,
          userId: userId,
          username: response.username,
          role: response.role,
          isPremium: response.isPremium,
          balance: response.balance || 0
        });
        if (userId) setupE2EEKeys(userId);
      }
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    verify2FA,
    setup2FA,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
