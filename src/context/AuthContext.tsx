import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../services/api';

interface UserData {
  username: string;
  name: string;
  surname: string;
  email: string;
  groups: string[];
  is_staff: boolean;
  is_superuser: boolean;
  primary_role: 'admin' | 'tenant' | null;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true); // Set loading true when checking
    try {
      const response = await apiClient.get<{ authenticated: boolean; user?: UserData }>('/api/auth/me/');
      if (response.data.authenticated && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Function to update user state upon successful login
  const login = (userData: UserData) => {
    setUser(userData);
    setIsLoading(false);
  };

  // Function to handle logout
  const logout = async () => {
    setIsLoading(true); 
    try {
        await apiClient.post('/api/auth/logout/');
        setUser(null); 
    } catch (error) {
        console.error("Logout failed:", error);

        setUser(null);
    } finally {
       setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};