import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import { useAuth } from "../context/AuthContext";
import { getInitialRedirectPath } from "../routesConfig";
import { useTheme } from "@mui/material";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authState } = useAuth();
  const theme = useTheme();

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  const fromLocation = location.state?.from;
  const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search ?? ""}${fromLocation.hash ?? ""}` : null;

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
          marginTop: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            height: 80,
            width: 80,
            borderRadius: "100%",
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            overflow: "hidden",
          }}
        >
          <img src="/logo.svg" alt="logo" style={{ width: 80, height: 80, filter: "brightness(0) invert(1)" }} />
        </Box>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        {isDemoMode && (
          <Alert severity="info" sx={{ width: "100%", mt: 2 }}>
            Demo Version:
            <br /> Login with user "<strong>demo</strong>" &amp; password "<strong>demo</strong>".
          </Alert>
        )}
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
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/password-reset")}
              sx={{ cursor: "pointer", marginBottom: "16px" }}
            >
              Passwort vergessen?
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
