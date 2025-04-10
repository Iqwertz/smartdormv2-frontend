// src/components/dashboard/content/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import apiClient from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { TenantProfile } from '../../../../types/tenant';

const UserProfile: React.FC = () => {
  const { authState } = useAuth();
  const [tenantData, setTenantData] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setLoading(true);
      apiClient
        .get('/api/tenants/profile-data')
        .then((response) => {
          setTenantData(response.data);
          setError(null);
        })
        .catch((err) => {
          setError('Failed to load tenant profile.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authState]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!tenantData) {
    return (
      <Box p={2}>
        <Typography>No profile data available.</Typography>
      </Box>
    );
  }

  return (
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Name"
            value={tenantData.name || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Surname"
            value={tenantData.surname || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Email"
            value={tenantData.email || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Birthday"
            value={tenantData.birthday || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Gender"
            value={tenantData.gender || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Nationality"
            value={tenantData.nationality || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Telephone"
            value={tenantData.tel_number || 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Extension"
            value={tenantData.extension ?? 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="University"
            value={tenantData.university || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Study Field"
            value={tenantData.study_field || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Move-in"
            value={tenantData.move_in || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Move-out"
            value={tenantData.move_out || ''}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Room"
            value={tenantData.current_room || 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Floor"
            value={tenantData.current_floor || 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Points"
            value={tenantData.current_points ?? 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Deposit"
            value={tenantData.deposit ?? 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Sublet"
            value={tenantData.sublet ?? 'N/A'}
            fullWidth
            disabled
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>
  );
};

export default UserProfile;