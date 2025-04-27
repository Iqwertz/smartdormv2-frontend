// src/pages/TenantPage.tsx
import React from "react";
import { Box } from "@mui/material"; // Import Box
import Sidebar, { SidebarItemProps } from "../components/shared/Sidebar"; // Import Sidebar
import { useAuth } from "../context/AuthContext";
import "../styles/global.scss";
import {
  ArticleOutlined,
  AssignmentIndOutlined,
  BedOutlined,
  DirectionsRunOutlined,
  Inventory2Outlined,
  People,
} from "@mui/icons-material";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import TenantDataTable from "../components/admin/TenantDataTable";

const AdminPage: React.FC = () => {
  const { logout } = useAuth();
  const sidebarItems: SidebarItemProps[] = [
    {
      id: "bewohner",
      icon: <People />,
      title: "Bewohner",
      path: "/",
    },
    {
      id: "auszüge",
      icon: <DirectionsRunOutlined />,
      title: "Auszüge",
      path: "/departures",
    },
    {
      id: "verlängerungen",
      icon: <ArticleOutlined />,
      title: "Verlängerungen",
      path: "/claims",
    },
    {
      id: "untermiete",
      icon: <BedOutlined />,
      title: "Untermiete",
      path: "/subtenants",
    },
    {
      id: "hsv",
      icon: <AssignmentIndOutlined />,
      title: "HSV",
      path: "/hsv",
    },
    {
      id: "pakete",
      icon: <Inventory2Outlined />,
      title: "Pakete",
      path: "/orders",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };
  return (
    // Use Flexbox for the overall layout
    <div className="background">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar takes its defined width */}
        <Sidebar items={sidebarItems} onLogout={handleLogout} />
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
