// src/components/dashboard/content/LogoutButton.tsx
/**
 * A simple logout button component.
 */
import React from 'react';
import { Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../../../../context/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
      
  const handleLogout = async () => {
      await logout();
      // Optionally, redirect to the login page or show a message
  };
  return(
  <Button
    variant="outlined"
    color="error"
    startIcon={<Logout />}
    fullWidth
    onClick={handleLogout}
  >
    Logout
  </Button>
)
};

export default LogoutButton;