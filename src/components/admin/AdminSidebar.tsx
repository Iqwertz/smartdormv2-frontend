import React from "react";
import Sidebar, { SidebarItemProps } from "../shared/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  ArticleOutlined,
  AssignmentIndOutlined,
  BedOutlined,
  DirectionsRunOutlined,
  Inventory2Outlined,
  People,
} from "@mui/icons-material";

const adminSidebarItems: SidebarItemProps[] = [
  {
    id: "bewohner",
    icon: <People />,
    title: "Bewohner",
    path: "/admin",
  },
  {
    id: "auszüge",
    icon: <DirectionsRunOutlined />,
    title: "Auszüge",
    path: "/admin/departures",
  },
  {
    id: "verlängerungen",
    icon: <ArticleOutlined />,
    title: "Verlängerungen",
    path: "/admin/claims",
  },
  {
    id: "untermiete",
    icon: <BedOutlined />,
    title: "Untermiete",
    path: "/admin/subtenants",
  },
  {
    id: "hsv",
    icon: <AssignmentIndOutlined />,
    title: "HSV",
    path: "/admin/hsv",
  },
  {
    id: "pakete",
    icon: <Inventory2Outlined />,
    title: "Pakete",
    path: "/admin/orders",
  },
];

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return <Sidebar items={adminSidebarItems} onLogout={handleLogout} />;
};

export default AdminSidebar;
