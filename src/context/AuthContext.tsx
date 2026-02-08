import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, User> = {
  'individual@demo.com': {
    id: '1',
    type: 'individual',
    name: 'Rahul Sharma',
    email: 'individual@demo.com',
    phone: '+91 98765 43210',
    isVerified: true,
    trustScore: 85,
    createdAt: '2024-01-15',
  },
  'org@demo.com': {
    id: '2',
    type: 'organization',
    name: 'Dr. Priya Patel',
    email: 'org@demo.com',
    phone: '+91 98765 43211',
    isVerified: true,
    trustScore: 95,
    createdAt: '2024-01-10',
    organizationType: 'ngo',
    organizationName: 'Hope Foundation India',
    specialization: 'Medical Aid & Food Distribution',
  },
  'poc@gov.in': {
    id: '3',
    type: 'poc',
    name: 'Amit Kumar Singh',
    email: 'poc@gov.in',
    phone: '+91 98765 43212',
    isVerified: true,
    trustScore: 100,
    createdAt: '2024-01-01',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('relief_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: UserType) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.type === userType) {
      setUser(mockUser);
      localStorage.setItem('relief_user', JSON.stringify(mockUser));
    } else {
      // Create a demo user for any login
      const newUser: User = {
        id: Date.now().toString(),
        type: userType,
        name: email.split('@')[0],
        email,
        phone: '+91 98765 00000',
        isVerified: userType !== 'poc',
        trustScore: userType === 'poc' ? 100 : 50,
        createdAt: new Date().toISOString(),
        ...(userType === 'organization' && {
          organizationType: 'ngo',
          organizationName: 'Demo Organization',
          specialization: 'General Relief',
        }),
        ...(userType === 'poc' && {
          district: 'Demo District',
          state: 'Demo State',
        }),
      };
      setUser(newUser);
      localStorage.setItem('relief_user', JSON.stringify(newUser));
    }
    setIsLoading(false);
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      type: userData.type || 'individual',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      isVerified: false,
      trustScore: 0,
      createdAt: new Date().toISOString(),
      ...userData,
    };
    
    setUser(newUser);
    localStorage.setItem('relief_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('relief_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('relief_user', JSON.stringify(updatedUser));
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
