import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getAccessToken, setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        if (!getAccessToken()) return;
        const data = await authApi.me();
        setUser(data.user);
      } catch {
        setAccessToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await authApi.register(name, email, password);
    if (data.accessToken) setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setAccessToken('');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
