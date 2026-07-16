// ============================================================
// AuthContext — manages user state, tokens, login/logout/refresh
// Access token stored in memory (never localStorage).
// ============================================================
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, signupClinic as apiSignup, logout as apiLogout, refreshToken as apiRefresh, getProfile as apiGetProfile } from '../api/auth';
import { setAccessToken, clearAccessToken } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — attempt silent refresh
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRefresh();
        setAccessToken(res.data.accessToken);
        const profile = await apiGetProfile();
        if (!cancelled) setUser(profile.data.user || profile.data);
      } catch {
        clearAccessToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Listen for forced logout event (emitted by client.js on refresh failure)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    const { accessToken, user: userData } = res.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  }, []);

  const signup = useCallback(async (data) => {
    const res = await apiSignup(data);
    const { accessToken, user: userData } = res.data;
    if (accessToken) setAccessToken(accessToken);
    if (userData) setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  }), [user, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
