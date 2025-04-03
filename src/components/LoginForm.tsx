// src/components/LoginForm.tsx (Ensure it's clean)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
// No CssBaseline needed here if LoginPage has it
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container'; // Keep Container for max-width

interface LoginResponse {
  role: 'admin' | 'tenant';
}

const LoginForm: React.FC = () => {
  // ... useState, navigate, error, handleSubmit logic ...
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); // Clear previous errors

        try {
        const response = await axios.post<LoginResponse>(
            `${API_BASE_URL}/login`,
            { username, password, keepLoggedIn },
            { withCredentials: true }
        );
        const { role } = response.data;
        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'tenant') {
            navigate('/tenant');
        } else {
            setError('Login successful, but role is unrecognized.');
        }
        } catch (err) {
        console.error('Login failed', err);
        if (axios.isAxiosError(err) && err.response) {
            setError(err.response.data?.message || 'Invalid username or password.');
        } else {
            setError('Login failed. Please try again.');
        }
        }
    };


  return (
    // Container sets max-width and adds some default horizontal padding
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 3, // Padding-top relative to theme spacing
          pb: 3, // Padding-bottom relative to theme spacing
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Login
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Benutzername"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error && !password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Passwort"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1}}>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} />}
                label="Angemeldet bleiben"
              />
              <Typography variant="body2" color="textSecondary">
                <a href="/forgot-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                Passwort vergessen?
                </a>
              </Typography>
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 0 }}
          >
            Anmelden
          </Button>
             
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;