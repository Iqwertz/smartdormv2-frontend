// src/components/dashboard/content/LogoutButton.tsx
/**
 * A simple logout button component.
 */
import React from 'react';
import { Button } from '@mui/material';
import { Logout } from '@mui/icons-material';

const LogoutButton: React.FC = () => (
  <Button
    variant="outlined"
    color="error"
    startIcon={<Logout />}
    fullWidth
    onClick={() => console.log('Logout clicked')}
  >
    Logout
  </Button>
);

export default LogoutButton;