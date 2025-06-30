import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, type LoginRequest, type UserProfile } from '@/api/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  userProfile: UserProfile | null;
  login: (identifier: string, password: string, isStudent?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (identifier: string, password: string, isStudent = false) => {
    try {
      const loginData: LoginRequest = { identifier, password, isStudent };
      const response = await authAPI.login(loginData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Convert user to UserProfile format
      const userProfile: UserProfile = {
        ...user,
        createdAt: new Date().toISOString(), // This will be updated when we fetch the profile
      };
      
      setCurrentUser(userProfile);
      setUserProfile(userProfile);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const response = await authAPI.getProfile();
          const freshUser = response.data;
          
          setCurrentUser(freshUser);
          setUserProfile(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};