// src/pages/TenantPage.tsx
import React from "react";
import { Box } from "@mui/material"; // Import Box
import UserProfile from "../components/tenants/dashboard/content/UserProfile";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import "../styles/bento-layout.scss";
import "../styles/global.scss";
import Settings from "../components/tenants/dashboard/content/Settings";
import Sidebar, { SidebarItemProps } from "../components/shared/Sidebar"; // Import Sidebar
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import PieChartIcon from "@mui/icons-material/PieChart";
import FolderIcon from "@mui/icons-material/Folder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuth } from "../context/AuthContext";
import CalendarWidget from "../components/tenants/dashboard/content/CalendarWidget";

const TenantPage: React.FC = () => {
  const { logout } = useAuth();
  const sidebarItems: SidebarItemProps[] = [
    {
      id: "dashboard",
      icon: <HomeIcon />,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "user",
      icon: <PersonIcon />,
      title: "User",
      path: "/user",
    },
    {
      id: "messages",
      icon: <ChatIcon />,
      title: "Messages",
      path: "/messages",
    },
    {
      id: "analytics",
      icon: <PieChartIcon />,
      title: "Analytics",
      path: "/analytics",
      groups: ["admin", "netzwerkreferat"],
    },
    {
      id: "files",
      icon: <FolderIcon />,
      title: "File Manager",
      path: "/files",
    },
    {
      id: "orders",
      icon: <ShoppingCartIcon />,
      title: "Orders",
      path: "/orders",
      groups: ["admin", "sales"],
    },
    {
      id: "saved",
      icon: <FavoriteIcon />,
      title: "Saved",
      path: "/saved",
    },
    {
      id: "settings",
      icon: <SettingsIcon />,
      title: "Setting",
      path: "/settings",
      groups: ["admin"],
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
            flexGrow: 1, // Takes up remaining horizontal space
            p: 1, // Add padding around the content area
            // The sidebar library might handle margin/padding adjustment automatically when open/closed.
            // If not, you might need to add dynamic marginLeft based on sidebar state/width.
            // However, modern sidebar implementations often handle this via transforms or internal padding.
            overflow: "auto", // Add scroll for content overflow
            position: "relative", // Needed for the ::before pseudo-element if you keep it
            zIndex: 1, // Ensure content is above the potential background pseudo-element
          }}
        >
          {/* Your existing grid layout */}
          <div className="grid">
            {/* The ::before element for background blur is now applied here if needed */}
            <div className="left">
              <DashboardCard title="Deine Daten">
                <UserProfile />
              </DashboardCard>
              <DashboardCard title="Statistics">
                {/* Placeholder content */}
                <div>Some stats here</div>
                <div>Some stats here</div>
              </DashboardCard>
            </div>
            <div className="right">
              <DashboardCard title="Notifications">
                <div>Some notifications here</div>
              </DashboardCard>
              <DashboardCard title="Kalendar">
                <CalendarWidget></CalendarWidget>
              </DashboardCard>
              <DashboardCard title="Settings">
                <Settings />
              </DashboardCard>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default TenantPage;
