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
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";

import TenantPage from "./pages/TenantPage";
import DepartmentPage from "./pages/DepartmentPage";
import HSVPage from "./pages/shared/HSVPage";
import ParcelPage from "./pages/admin/ParcelPage";
import Error403Page from "./pages/Error403Page";
import { Assignment, AssignmentOutlined, FilterVintageOutlined, PersonAdd } from "@mui/icons-material";
import HeimratPage from "./pages/engagements/HeimratPage";
import NewTenantPage from "./pages/admin/NewTenantPage";
import EditTenantPage from "./pages/admin/EditTenantPage";
import EditSubtenantPage from "./pages/admin/EditSubtenantPage";
import NewSubtenantPage from "./pages/admin/NewSubtenantPage";
import SubtenantPage from "./pages/admin/SubtenantPage";
import DepartmentSignaturePage from "./pages/engagements/DepartmentSignaturePage";
import DeparturesPage from "./pages/admin/DeparturesPage";
import ExtensionsPage from "./pages/admin/ExtensionsPage";
import { ALL_FLOORS } from "./config";
import ApplyEngagementPage from "./pages/tenants/ApplyEngagementPage";
import ViewApplicationsPage from "./pages/tenants/ViewApplicationsPage";
import EngagementManagementPage from "./pages/engagements/EngagementManagementPage";

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

//Generate routes for floorspeaker signatures
const floorSignatureRoutes = ALL_FLOORS.map((floor) => ({
  id: `signatures-${floor.toLowerCase()}`,
  path: `/signatures/${floor.toLowerCase()}`,
  element: <DepartmentSignaturePage departmentSlug={floor.toLowerCase()} departmentDisplayName={floor} />,
  title: `Unterschriften ${floor}`,
  icon: <DrawOutlinedIcon />,
  requiredGroups: ["ADMIN", `Flursprecher-${floor}`],
  sidebar: true,
}));

console.log("Generated floor signature routes:", floorSignatureRoutes);

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
  {
    id: "apply-engagement",
    path: "/apply-engagement",
    element: <ApplyEngagementPage />,
    title: "Referatsbewerbungen",
    icon: <AssignmentOutlined />,
    requiredGroups: ["tenant", "ADMIN"],
    sidebar: true,
  },
  {
    id: "view-applications",
    path: "/view-applications",
    element: <ViewApplicationsPage />,
    requiredGroups: [], // All authenticated users can view if enabled
    sidebar: false,
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
    element: <DeparturesPage />,
    title: "Auszüge",
    icon: <DirectionsRunOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "extensions",
    path: "/department/extensions",
    element: <ExtensionsPage />,
    title: "Verlängerungen",
    icon: <ArticleOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "subtenancies",
    path: "/department/subtenancies",
    element: <SubtenantPage />,
    title: "Untermiete",
    icon: <BedOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "new-subtenant",
    path: "/department/new-subtenant",
    element: <NewSubtenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
  },
  {
    id: "edit-subtenant",
    path: "/department/edit-subtenant/:id",
    element: <EditSubtenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
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
  {
    id: "engagement-management",
    path: "/referate",
    element: <EngagementManagementPage />,
    title: "Referate",
    icon: <AssignmentIndOutlinedIcon />,
    requiredGroups: ["Heimrat", "Inforeferat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "signatures-tutoren",
    path: "/signatures/tutoren",
    element: <DepartmentSignaturePage departmentSlug="tutoren" departmentDisplayName="Tutoren" />,
    title: "Auszüge Tutoren",
    icon: <DrawOutlinedIcon />,
    requiredGroups: ["Tutoren", "ADMIN"],
    sidebar: true,
  },
  {
    id: "signatures-bar",
    path: "/signatures/bar",
    element: <DepartmentSignaturePage departmentSlug="bar" departmentDisplayName="Barreferat" />,
    title: "Auszüge Bar",
    icon: <DrawOutlinedIcon />,
    requiredGroups: ["Barreferat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "signatures-werk",
    path: "/signatures/werk",
    element: <DepartmentSignaturePage departmentSlug="werk" departmentDisplayName="Werkreferat" />,
    title: "Auszüge Werk",
    icon: <DrawOutlinedIcon />,
    requiredGroups: ["Werkreferat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "signatures-innen",
    path: "/signatures/innen",
    element: <DepartmentSignaturePage departmentSlug="innen" departmentDisplayName="Innenreferat" />,
    title: "Auszüge Innen",
    icon: <DrawOutlinedIcon />,
    requiredGroups: ["Innenreferat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "signatures-finanzen",
    path: "/signatures/finanzen",
    element: <DepartmentSignaturePage departmentSlug="finanzen" departmentDisplayName="Finanzenreferat" />,
    title: "Auszüge Finanzen",
    icon: <DrawOutlinedIcon />,
    requiredGroups: ["Finanzenreferat", "ADMIN"],
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
  //Generated floor speaker routes in the end since else it looks messy for the testadmin
  ...floorSignatureRoutes,
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
