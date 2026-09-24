import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { Lock, SchoolOutlined } from "@mui/icons-material";
import LogoutButton from "./LogoutButton";
import PasswordChangeModal from "./PasswordChangeModal";
import SchollwireIpButton from "./SchollwireIpButton";

interface SettingsProps {
  /** Replays the introduction tour. Only passed on the tenant dashboard. */
  onRestartTutorial?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onRestartTutorial }) => {
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

        {onRestartTutorial && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SchoolOutlined />}
            fullWidth
            onClick={onRestartTutorial}
          >
            Tutorial erneut starten
          </Button>
        )}

        <LogoutButton />
        <PasswordChangeModal 
          open={passwordModalOpen} 
          onClose={() => setPasswordModalOpen(false)} 
        />
    </Box>
  );
};

export default Settings;