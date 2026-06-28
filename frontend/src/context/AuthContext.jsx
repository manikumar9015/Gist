import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('easyread-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Restore user from stored token (decode basic info)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub, role: localStorage.getItem('easyread-role') || 'USER' });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    const { token: newToken, username: uname, email, role } = res.data;
    localStorage.setItem('easyread-token', newToken);
    localStorage.setItem('easyread-role', role);
    setToken(newToken);
    setUser({ username: uname, email, role });
    return res.data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    const { token: newToken, username: uname, email: uEmail, role } = res.data;
    localStorage.setItem('easyread-token', newToken);
    localStorage.setItem('easyread-role', role);
    setToken(newToken);
    setUser({ username: uname, email: uEmail, role });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('easyread-token');
    localStorage.removeItem('easyread-role');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
