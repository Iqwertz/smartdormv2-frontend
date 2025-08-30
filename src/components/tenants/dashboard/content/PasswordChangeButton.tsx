import React from 'react';
import { Button } from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

const PasswordChangeButton: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
      
  const handlePasswordChange = () => {
    // Navigate to password reset page with the user's email pre-filled
    const userEmail = authState.user?.email;
    if (userEmail) {
      navigate('/password-reset', { 
        state: { preFilledEmail: userEmail } 
      });
    } else {
      // Fallback: navigate without pre-filled email
      navigate('/password-reset');
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<LockReset />}
      fullWidth
      onClick={handlePasswordChange}
    >
      Passwort ändern
    </Button>
  );
};

export default PasswordChangeButton;
