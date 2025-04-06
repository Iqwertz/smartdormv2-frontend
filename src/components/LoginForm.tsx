// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserData {
  username: string;
  name: string;
  surname: string;
  email: string;
  groups: string[];
  is_staff: boolean;
  is_superuser: boolean;
  primary_role: 'admin' | 'tenant' | null; // Role determined by backend
}

interface LoginResponse {
  success: boolean;
  user?: UserData;
  message?: string;
}

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/tenant";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>(
        '/api/auth/login/',
        { username, password, rememberMe }
      );

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        login(user);

        if (user.primary_role === 'admin') {
            navigate(location.state?.from?.pathname || '/admin', { replace: true });
        } else if (user.primary_role === 'tenant') {
            navigate(from, { replace: true });
        } else {
             navigate(from, { replace: true });
        }

      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err: any) {
        console.error('Login request failed', err);
        if (err.response) {
            if (err.response.status === 403) {
                 setError(err.response.data?.detail || 'Permission denied. CSRF check might have failed.');
            } else {
                 setError(err.response.data?.message || 'Invalid username or password.');
            }
        } else {
            setError('Login failed. Could not connect to the server.');
        }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;