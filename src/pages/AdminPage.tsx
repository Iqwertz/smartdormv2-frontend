// src/pages/TenantPage.tsx
import React from "react";
import { Box } from "@mui/material"; // Import Box
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import TenantDataTable from "../components/admin/TenantDataTable";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminPage: React.FC = () => {
  return (
    // Use Flexbox for the overall layout
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <Box
          component="main"
          sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            flexGrow: 1, // Takes up remaining horizontal space
            p: 1, // Add padding around the content area
            overflow: "auto", // Add scroll for content overflow
            position: "relative", // Needed for the ::before pseudo-element if you keep it
            zIndex: 1, // Ensure content is above the potential background pseudo-element
          }}
        >
          <DashboardCard
            title="Bewohner Übersicht"
            cardSx={{ flexGrow: 1 }}
            contentSx={{ height: "calc(85vh + 40px)" }}
          >
            {" "}
            <TenantDataTable />
          </DashboardCard>
        </Box>
      </Box>
    </div>
  );
};

export default AdminPage;
