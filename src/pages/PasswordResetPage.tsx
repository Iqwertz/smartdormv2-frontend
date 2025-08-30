import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import CssBaseline from "@mui/material/CssBaseline";
import apiClient from "../services/api";

const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post("/api/auth/password-reset/", { email });
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || "Wenn die E-Mail-Adresse existiert, wurde eine Passwort-Reset-E-Mail gesendet."
        });
        setEmail("");
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || "Ein Fehler ist aufgetreten."
        });
      }
    } catch (err: any) {
      console.error("Password reset request failed", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          position: "relative",
          backgroundImage: "url(./img/Wohnheim.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 1,
          },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            position: "relative",
            zIndex: 2,
            margin: 2,
            backgroundColor: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
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
                <LockResetOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Passwort zurücksetzen
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen ein neues Passwort zu.
              </Typography>
              
              {message && (
                <Alert severity={message.type} sx={{ width: "100%", mt: 2 }}>
                  {message.text}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="E-Mail-Adresse"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={message?.type === 'error'}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? "Wird gesendet..." : "Passwort zurücksetzen"}
                </Button>
                <Box sx={{ textAlign: "center" }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/login")}
                    sx={{ cursor: "pointer" }}
                  >
                    Zurück zum Login
                  </Link>
                </Box>
              </Box>
            </Box>
          </Container>
        </Paper>
      </Box>
    </>
  );
};

export default PasswordResetPage;
