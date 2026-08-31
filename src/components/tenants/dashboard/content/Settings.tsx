import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { Lock } from "@mui/icons-material";
import LogoutButton from "./LogoutButton";
import PasswordChangeModal from "./PasswordChangeModal";
import SchollwireIpButton from "./SchollwireIpButton";

const Settings: React.FC = () => {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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
          startIcon={<Lock />}
          fullWidth
          onClick={handlePasswordEdit}
        >
          Passwort ändern
        </Button>
        
        <SchollwireIpButton />

        <LogoutButton />
        <PasswordChangeModal 
          open={passwordModalOpen} 
          onClose={() => setPasswordModalOpen(false)} 
        />
    </Box>
  );
};

export default Settings;