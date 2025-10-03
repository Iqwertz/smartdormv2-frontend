import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { LockReset, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import LogoutButton from "./LogoutButton";
import PasswordChangeModal from "./PasswordChangeModal";

const Settings: React.FC = () => {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { authState } = useAuth();
  const navigate = useNavigate();

  const handlePasswordReset = () => {
    const userEmail = authState.user?.email;
    if (userEmail) {
      navigate('/password-reset', { 
        state: { preFilledEmail: userEmail } 
      });
    } else {
      navigate('/password-reset');
    }
  };

  const handlePasswordEdit = () => {
    setPasswordModalOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LockReset />}
          fullWidth
          onClick={handlePasswordReset}
        >
          Passwort zurücksetzen
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Lock />}
          fullWidth
          onClick={handlePasswordEdit}
        >
          Passwort ändern
        </Button>
        
        <LogoutButton />
        <PasswordChangeModal 
          open={passwordModalOpen} 
          onClose={() => setPasswordModalOpen(false)} 
        />
    </Box>
  );
};

export default Settings;