import React from "react";
import Sidebar, { SidebarItemProps } from "../shared/Sidebar";
import { useAuth } from "../../context/AuthContext";
import HomeIcon from "@mui/icons-material/Home";
import { AssignmentIndOutlined } from "@mui/icons-material";

const tenantSidebarItems: SidebarItemProps[] = [
  {
    id: "dashboard",
    icon: <HomeIcon />,
    title: "Dashboard",
    path: "/tenant",
  },
  {
    id: "hsv",
    icon: <AssignmentIndOutlined />,
    title: "HSV",
    path: "/tenant/hsv",
  },
];

const TenantSidebar: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return <Sidebar items={tenantSidebarItems} onLogout={handleLogout} />;
};

export default TenantSidebar;
