import React, { createContext, useContext, useEffect, useState } from "react";
import { login, checkAuth, logout } from "../api/authService";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  loginUser: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { role } = await checkAuth();
        setIsAuthenticated(true);
        navigate(role === "admin" ? "/admin" : "/tenant");
      } catch {
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  const loginUser = async (email: string, password: string, rememberMe: boolean) => {
    await login(email, password, rememberMe);
    const { role } = await checkAuth();
    setIsAuthenticated(true);
    navigate(role === "admin" ? "/admin" : "/tenant");
  };

  const logoutUser = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  console.log(loginUser, logoutUser, isAuthenticated);

  return children;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
