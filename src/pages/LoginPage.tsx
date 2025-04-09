// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/LoginForm';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';

const LoginPage: React.FC = () => {
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1,
          },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            position: 'relative',
            zIndex: 2,
            margin: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <LoginForm />
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;