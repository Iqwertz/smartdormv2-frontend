// src/pages/TenantPage.tsx
import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container'; // Using Container for centering and max-width
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';

const WelcomeMessage: React.FC = () => (
  <Typography variant="body1">Welcome back, Tenant!</Typography>
);

const RentStatus: React.FC = () => (
  <>
    <Typography variant="h6" gutterBottom>Rent Status</Typography>
    <Typography variant="body1">Next Payment Due: October 31st</Typography>
    <Typography variant="body1">Amount: $1200</Typography>
  </>
);

const MaintenanceRequests: React.FC = () => (
  <>
    <Typography variant="h6" gutterBottom>Maintenance Requests</Typography>
    <Typography variant="body1">No open requests.</Typography>
  </>
);

const QuickLinks: React.FC = () => (
  <>
    <Typography variant="h6" gutterBottom>Quick Links</Typography>
    <Stack spacing={1}>
        <Typography variant="body2" component="a" href="#" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Pay Rent Online</Typography>
        <Typography variant="body2" component="a" href="#" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Submit Maintenance</Typography>
        <Typography variant="body2" component="a" href="#" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Community Rules</Typography>
    </Stack>
  </>
);

const ContactInfo: React.FC = () => (
    <>
        <Typography variant="h6" gutterBottom>Contact Landlord</Typography>
        <Typography variant="body2">Phone: 555-123-4567</Typography>
        <Typography variant="body2">Email: landlord@example.com</Typography>
    </>
);
const TenantPage: React.FC = () => {
  const itemSpacing = 2;

  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1">
          Tenant Dashboard
        </Typography>
        <Grid container spacing={itemSpacing}> 
          <Grid item xs={12} md={9}>
            <Stack spacing={itemSpacing}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <WelcomeMessage />
              </Paper>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <RentStatus />
              </Paper>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <MaintenanceRequests />
              </Paper>
               <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 150 }}>
                 <Typography variant="h6">Another Main Section</Typography>
                 <Typography>More content goes here...</Typography>
              </Paper>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack spacing={itemSpacing}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <QuickLinks />
              </Paper>

              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <ContactInfo />
              </Paper>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                 <Typography variant="h6">Announcements</Typography>
                 <Typography variant='body2'>Next inspection: Nov 5th.</Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default TenantPage;