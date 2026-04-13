import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, removeToken } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  xp: number;
  level: number;
  city: string;
  is_admin: boolean;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch {
      await removeToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    if (data.access_token) {
      await setToken(data.access_token);
    }
    setUser(data);
  }

  async function register(email: string, password: string, name?: string) {
    const data = await api.register(email, password, name);
    if (data.access_token) {
      await setToken(data.access_token);
    }
    setUser(data);
  }

  async function logout() {
    try {
      await api.logout();
    } catch {}
    await removeToken();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
