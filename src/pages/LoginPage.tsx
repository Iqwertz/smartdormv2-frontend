// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoginForm from '../components/LoginForm'; // Assuming LoginForm uses MUI

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // The component for the visual box
import CssBaseline from '@mui/material/CssBaseline';
// --- End MUI Imports ---


interface MeResponse {
  role: 'admin' | 'tenant';
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // ... checkAuth logic remains the same ...
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
      {/* Outer Box for centering and page background */}
      {/* Using sx here primarily for layout, assuming bgcolor comes from theme */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default', // Uses the default background color defined in your theme palette
        }}
      >
        {/*
          Paper component acts as the visual container.
          Its appearance (background color, border-radius)
          is determined by your ThemeProvider theme settings.
          We only set the elevation prop directly.
        */}
        <Paper elevation={3}>
           {/*
            Padding inside the Paper now relies on the LoginForm's internal
            Container/Box structure or global theme overrides for MuiPaper.
           */}
          <LoginForm />
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;