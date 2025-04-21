// src/pages/TenantPage.tsx

import React from 'react';
import UserProfile from '../components/tenants/dashboard/content/UserProfile';
import DashboardCard from '../components/tenants/dashboard/DashboardCard';
import '../styles/tenantPage.scss'; // The order of Items on mobile can be changed here
import Settings from '../components/tenants/dashboard/content/Settings';
import { Box } from '@mui/material';

const TenantPage: React.FC = () => {
  return (
    <div className="grid">
      <div className="left">
        <DashboardCard title="Deine Daten">
          <UserProfile />
        </DashboardCard>
        <DashboardCard title="Statistics">
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
          <div>Some stats here</div>
        </DashboardCard>
      </div>
      <div className="right">
        <DashboardCard title="Notifications">
          <div>Some notifications here</div>
        </DashboardCard>
        <DashboardCard title="Settings">
          <Settings />
        </DashboardCard>
      </div>
    </div>
  );
};

export default TenantPage;
