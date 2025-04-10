/**
 * Just some demo component
 */
import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import DashboardCard from '../DashboardCard';

const PaymentStatus: React.FC = () => (
  <DashboardCard title="Payment Status">
     <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
        <Box>
            <Typography variant="body1" color="text.secondary">
            Next Payment Due: May 1, 2025
            </Typography>
            <Typography variant="body1" color="success.main" gutterBottom>
            Status: Paid
            </Typography>
        </Box>
        <Button variant="contained" color="primary" sx={{ mt: 'auto' }}> {/* Pushes button to bottom */}
            View Payment History
        </Button>
    </Box>
  </DashboardCard>
);

export default PaymentStatus;