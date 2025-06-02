import React from "react";
import { Box } from "@mui/material";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import TenantDataTable from "../components/admin/TenantDataTable";

const DepartmentPage: React.FC = () => {
  return (
    <Box
      sx={{
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <DashboardCard
        title="Bewohner Übersicht"
        cardSx={{
          flexGrow: 1,
          height: "calc(100vh - 64px - 3rem - 16px)",
        }}
        contentSx={{ height: "calc(100% - 40px)" }}
      >
        <TenantDataTable />
      </DashboardCard>
    </Box>
  );
};

export default DepartmentPage;
