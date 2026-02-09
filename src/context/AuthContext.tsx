import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth now backed by server via passport sessions

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
    async function check() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/user`, { credentials: 'include' });
        if (res.ok) {
          const u = await res.json();
          setUser(u);
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    check();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const u = await res.json();
      setUser(u);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Registration failed');
      const u = await res.json();
      setUser(u);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
