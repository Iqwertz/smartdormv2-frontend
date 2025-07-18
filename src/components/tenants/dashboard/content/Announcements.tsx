// src/components/dashboard/content/Announcements.tsx
/**
 * Displays recent announcements within a DashboardCard.
 */
import React from "react";
import { Typography, Button, Divider } from "@mui/material";
import DashboardCard from "../../../shared/DashboardCard";

const Announcements: React.FC = () => (
  <DashboardCard
    title="Announcements"
    action={
      <Button size="small" color="primary">
        View All
      </Button>
    }
  >
    <Typography variant="body1">Maintenance scheduled for April 15, 2025, from 9 AM to 12 PM.</Typography>
    <Divider sx={{ my: 1 }} />
    <Typography variant="body1">New Wi-Fi password available at the front desk.</Typography>
  </DashboardCard>
);

export default Announcements;
