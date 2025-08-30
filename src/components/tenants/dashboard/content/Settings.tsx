import { Box } from "@mui/material";
import LogoutButton from "./LogoutButton";
import PasswordChangeButton from "./PasswordChangeButton";

const Settings: React.FC = () => {

  return (
     // Logout button
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
        <PasswordChangeButton />
        <LogoutButton />
    </Box>
  );
};

export default Settings;