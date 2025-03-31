// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoginForm from '../components/LoginForm'; 

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';


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
      }
    };
    checkAuth();
  }, [navigate]);

  return (
        <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          position: 'relative',
          backgroundImage: 'url(./img/Wohnheim.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             backgroundColor: 'rgba(0, 0, 0, 0)',
             zIndex: 1,
      
          },
        }}
      >
        <Paper
          elevation={3}
          sx={{
             position: 'relative',
             zIndex: 2,
             margin: 2,
             backgroundColor: 'rgba(255, 255, 255, 0.5)',
             backdropFilter: 'blur(10px)',
             WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;