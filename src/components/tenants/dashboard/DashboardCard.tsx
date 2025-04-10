import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  cardSx?: object;
  contentSx?: object;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  action,
  cardSx = {},
  contentSx = {},
}) => (
  <Card sx={{ borderRadius: 2, ...cardSx }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', ...contentSx }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" color="text.primary">
          {title}
        </Typography>
        {action}
      </Box>
      <Box>
        {children}
      </Box>
    </CardContent>
  </Card>
);

export default DashboardCard;
