import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import { getInitialRedirectPath } from "../routesConfig";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authState } = useAuth();

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // If redirected from a protected route, 'from' will have the path.
      // Otherwise, or if 'from' is no longer relevant, use getInitialRedirectPath.
      const redirectTo = from || getInitialRedirectPath(authState.user.groups);
      navigate(redirectTo, { replace: true });
    }
  }, [authState, navigate, from]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(username, password, rememberMe);
    } catch (err: any) {
      console.error("Login request failed", err);
      if (err.response?.status === 401) {
        setError("Ungültiger Benutzername oder Passwort.");
      } else if (err.response?.status === 403) {
        setError("Permission denied. CSRF check might have failed.");
      } else {
        setError("Login failed. Could not connect to the server.");
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
