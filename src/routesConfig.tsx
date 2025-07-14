/*
Here all routes are defined and authentication for the routes is managed. 
*/

import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DirectionsRunOutlined from "@mui/icons-material/DirectionsRunOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import BedOutlined from "@mui/icons-material/BedOutlined";

import TenantPage from "./pages/TenantPage";
import DepartmentPage from "./pages/DepartmentPage";
import HSVPage from "./pages/shared/HSVPage";
import ParcelPage from "./pages/admin/ParcelPage";
import Error403Page from "./pages/Error403Page";
import { FilterVintageOutlined, PersonAdd } from "@mui/icons-material";
import HeimratPage from "./pages/engagements/HeimratPage";
import NewTenantPage from "./pages/admin/NewTenantPage";
import EditTenantPage from "./pages/admin/EditTenantPage";

// Placeholder for pages that might need to be created
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div>
    <h2>{title}</h2>
    <p>Not implemented, will be implemented in the future.</p>
  </div>
);

export interface AppRoute {
  id: string;
  path: string;
  element: React.ReactElement;
  title?: string;
  icon?: React.ReactNode;
  requiredGroups?: string[];
  sidebar: boolean;
  defaultRedirectOrder?: number;
}

export const appRoutes: AppRoute[] = [
  ////////////////////////////////////////////////////////////
  // Tenant Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "dashboard",
    path: "/dashboard",
    element: <TenantPage />,
    title: "Dashboard",
    icon: <HomeIcon />,
    requiredGroups: ["tenant", "ADMIN"],
    sidebar: true,
    defaultRedirectOrder: 1,
  },
  ////////////////////////////////////////////////////////////
  // Department Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "department-overview",
    path: "/department/overview",
    element: <DepartmentPage />,
    title: "Bewohner",
    icon: <PeopleIcon />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
    defaultRedirectOrder: 2,
  },
  {
    id: "new-tenant",
    path: "/department/new-tenant",
    element: <NewTenantPage />,
    title: "Neuer Bewohner",
    icon: <PersonAdd />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "edit-tenant",
    path: "/department/edit-tenant/:id",
    element: <EditTenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
  },
  {
    id: "departures",
    path: "/department/departures",
    element: <PlaceholderPage title="Auszüge" />,
    title: "Auszüge",
    icon: <DirectionsRunOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "extensions",
    path: "/department/extensions",
    element: <PlaceholderPage title="Verlängerungen" />,
    title: "Verlängerungen",
    icon: <ArticleOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "subtenancies",
    path: "/department/subtenancies",
    element: <PlaceholderPage title="Untermiete" />,
    title: "Untermiete",
    icon: <BedOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "parcels",
    path: "/department/parcels",
    element: <ParcelPage />,
    title: "Pakete",
    icon: <Inventory2OutlinedIcon />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  ////////////////////////////////////////////////////////////
  // Engagement Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "heimrat",
    path: "/heimrat",
    element: <HeimratPage />,
    title: "Heimrat",
    icon: <FilterVintageOutlined />,
    requiredGroups: ["Heimrat", "ADMIN"],
    sidebar: true,
  },
  //////////////////////////////////////////////////////////////
  // General Routes:
  //////////////////////////////////////////////////////////////
  {
    id: "hsv",
    path: "/hsv",
    element: <HSVPage />,
    title: "HSV",
    icon: <AssignmentIndOutlinedIcon />,
    requiredGroups: [],
    sidebar: true,
    defaultRedirectOrder: 3,
  },
  {
    id: "not-authorized",
    path: "/not-authorized",
    element: <Error403Page />,
    requiredGroups: [],
    sidebar: false,
  },
];

export const loginRoute = "/login";
export const defaultAuthenticatedRoute = "/dashboard"; // Fallback if no specific route is found

// Helper function to get sidebar items based on user's groups
export const getSidebarItems = (userGroups: string[]): AppRoute[] => {
  return appRoutes.filter(
    (route) =>
      route.sidebar &&
      route.title &&
      route.icon &&
      (!route.requiredGroups ||
        route.requiredGroups.length === 0 ||
        route.requiredGroups.some((group) => userGroups.includes(group)))
  );
};

// Helper function to determine initial redirect path after login (Needed to redirect tenants and departments to their respective dashboards)
export const getInitialRedirectPath = (userGroups: string[]): string => {
  const accessibleRoutes = appRoutes
    .filter(
      (route) =>
        (route.requiredGroups && route.requiredGroups.length === 0) ||
        route.requiredGroups?.some((group) => userGroups.includes(group))
    )
    .sort((a, b) => {
      const orderA = a.defaultRedirectOrder ?? Infinity;
      const orderB = b.defaultRedirectOrder ?? Infinity;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return appRoutes.indexOf(a) - appRoutes.indexOf(b); // Fallback to array order
    });

  if (accessibleRoutes.length > 0) {
    return accessibleRoutes[0].path;
  }

  // Fallback if no routes are accessible
  return defaultAuthenticatedRoute;
};
