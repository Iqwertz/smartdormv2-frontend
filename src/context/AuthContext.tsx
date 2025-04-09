import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/api';
import { AuthState } from '../types/auth';

interface AuthContextProps {
  authState: AuthState;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/api/auth/me/');
      if (response.data.authenticated) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    }
  };

  const login = async (username: string, password: string, rememberMe: boolean) => {
    try {
      const response = await apiClient.post('/api/auth/login/', {
        username,
        password,
        rememberMe,
      });
      if (response.data.success) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout/', {});
      setAuthState({ user: null, isAuthenticated: false, loading: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};