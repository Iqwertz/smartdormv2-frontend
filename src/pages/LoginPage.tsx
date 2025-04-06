// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoginForm from '../components/LoginForm';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';

// Reuse the UserData interface (or import from a shared types file)
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

interface MeResponse {
  authenticated: boolean;
  user?: UserData;
  message?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<MeResponse>(`${API_BASE_URL}/api/auth/me/`, {
          withCredentials: true, // Send cookies
        });

        if (response.data.authenticated && response.data.user) {
          const user = response.data.user;
           // Navigate based on the primary role determined by the backend
           if (user.primary_role === 'admin') {
            navigate('/admin');
          } else if (user.primary_role === 'tenant') {
            navigate('/tenant');
          } else {
            // Fallback for users authenticated but without a specific primary role
            console.log('Already logged in, but no primary role. Groups:', user.groups);
            navigate('/tenant'); // Default to tenant page
          }
        }
        // If not authenticated, stay on the login page (do nothing)
      } catch (error) {
        // Error (like 401 Unauthorized) means not logged in, stay on login page
        if (axios.isAxiosError(error) && error.response?.status === 401) {
           console.log('Not authenticated.');
        } else {
           console.error('Failed to check authentication status', error);
        }
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
          backgroundImage: 'url(./img/Wohnheim.jpg)', // Ensure image path is correct relative to public folder or handled by Vite
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
             backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slightly darken background for better contrast
             zIndex: 1,
          },
        }}
      >
        <Paper
          elevation={6} // Increased elevation
          sx={{
             position: 'relative',
             zIndex: 2,
             margin: 2,
             backgroundColor: 'rgba(255, 255, 255, 0.55)', // Less transparent
             backdropFilter: 'blur(8px)',
             WebkitBackdropFilter: 'blur(8px)',
             borderRadius: 2, // Rounded corners
             overflow: 'hidden', // Clip content
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;