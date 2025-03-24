// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoginForm from '../components/LoginForm';

interface MeResponse {
  role: 'admin' | 'tenant';
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<MeResponse>(`${API_BASE_URL}/me`, {
          withCredentials: true,
        });
        const { role } = response.data;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'tenant') {
          navigate('/tenant');
        }
      } catch (error) {
        console.log('Not authenticated', error);
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;