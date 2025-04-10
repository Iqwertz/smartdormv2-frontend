// src/components/dashboard/content/QuickLinks.tsx
/**
 * Provides quick navigation links for common tenant actions.
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import DashboardCard from '../DashboardCard';

const QuickLinks: React.FC = () => (
  <DashboardCard title="Quick Links">
    <Box display="flex" flexDirection="column" gap={1}>
      <Button variant="text" color="primary" fullWidth sx={{ justifyContent: 'flex-start' }}>
        Maintenance Request
      </Button>
      <Button variant="text" color="primary" fullWidth sx={{ justifyContent: 'flex-start' }}>
        Contact Management
      </Button>
      <Button variant="text" color="primary" fullWidth sx={{ justifyContent: 'flex-start' }}>
        Roommate Finder
      </Button>
      <Button variant="text" color="primary" fullWidth sx={{ justifyContent: 'flex-start' }}>
        Event Calendar
      </Button>
    </Box>
  </DashboardCard>
);

export default QuickLinks;