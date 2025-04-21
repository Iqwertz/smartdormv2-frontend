import { Box } from "@mui/material";
import LogoutButton from "./LogoutButton";

const Settings: React.FC = () => {

  return (
     // Logout button
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '18px',
      }}
    >
        <LogoutButton></LogoutButton>
</Box>
  );
};

export default Settings;