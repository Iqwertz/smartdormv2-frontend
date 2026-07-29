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
import QrCode2Icon from "@mui/icons-material/QrCode2";
import {
  AssignmentOutlined,
  FilterVintageOutlined,
  Groups,
  GroupWorkOutlined,
  LanOutlined,
  PersonAdd,
  Print,
} from "@mui/icons-material";
import { ALL_FLOORS, ATTENDANCE_LINK_ROUTE } from "./config";

// Import all lazy page components from the dedicated pages file.
import * as Pages from "./pages";

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

export interface AppRouteGroup {
  name: string;
  routes: AppRoute[];
}

export type AppRouteItem = AppRoute | AppRouteGroup;

//Generate routes for floorspeaker signatures
const floorSignatureRoutes = ALL_FLOORS.map((floor) => ({
  id: `signatures-${floor.toLowerCase()}`,
  path: `/signatures/${floor.toLowerCase()}`,
  element: <Pages.DepartmentSignaturePage departmentSlug={floor.toLowerCase()} departmentDisplayName={floor} />,
  title: `Unterschriften ${floor}`,
  icon: <DrawOutlinedIcon />,
  requiredGroups: ["ADMIN", `Flursprecher-${floor}`],
  sidebar: true,
}));

console.log("Generated floor signature routes:", floorSignatureRoutes);

export const appRoutes: AppRouteItem[] = [
  ////////////////////////////////////////////////////////////
  // Tenant Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "dashboard",
    path: "/dashboard",
    element: <Pages.TenantPage />,
    title: "Dashboard",
    icon: <HomeIcon />,
    requiredGroups: ["tenant", "ADMIN"],
    sidebar: true,
    defaultRedirectOrder: 1,
  },
  {
    id: "apply-engagement",
    path: "/apply-engagement",
    element: <Pages.ApplyEngagementPage />,
    title: "Referatsbewerbungen",
    icon: <AssignmentOutlined />,
    requiredGroups: ["tenant", "ADMIN"],
    sidebar: true,
  },
  {
    id: "view-applications",
    path: "/view-applications",
    element: <Pages.ViewApplicationsPage />,
    requiredGroups: [], // All authenticated users can view if enabled
    sidebar: false,
  },
  {
    id: "print",
    path: "/print",
    element: <Pages.PrintPage />,
    title: "Drucken",
    icon: <Print />,
    requiredGroups: ["tenant", "ADMIN"],
    sidebar: true,
  },
  ////////////////////////////////////////////////////////////
  // Department Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "department-overview",
    path: "/department/overview",
    element: <Pages.DepartmentPage />,
    title: "Bewohner",
    icon: <PeopleIcon />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
    defaultRedirectOrder: 2,
  },
  {
    id: "new-tenant",
    path: "/department/new-tenant",
    element: <Pages.NewTenantPage />,
    title: "Neuer Bewohner",
    icon: <PersonAdd />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "edit-tenant",
    path: "/department/edit-tenant/:id",
    element: <Pages.EditTenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
  },
  {
    id: "departures",
    path: "/department/departures",
    element: <Pages.DeparturesPage />,
    title: "Auszüge",
    icon: <DirectionsRunOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "extensions",
    path: "/department/extensions",
    element: <Pages.ExtensionsPage />,
    title: "Verlängerungen",
    icon: <ArticleOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "subtenancies",
    path: "/department/subtenancies",
    element: <Pages.SubtenantPage />,
    title: "Untermiete",
    icon: <BedOutlined />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  {
    id: "new-subtenant",
    path: "/department/new-subtenant",
    element: <Pages.NewSubtenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
  },
  {
    id: "edit-subtenant",
    path: "/department/edit-subtenant/:id",
    element: <Pages.EditSubtenantPage />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: false,
  },
  {
    id: "parcels",
    path: "/department/parcels",
    element: <Pages.ParcelPage />,
    title: "Pakete",
    icon: <Inventory2OutlinedIcon />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
     {
    id: "printing-admin",
    path: "/department/printing",
    element: <Pages.PrintingAdminPage />,
    title: "Drucker",
    icon: <Print />,
    requiredGroups: ["VERWALTUNG", "ADMIN"],
    sidebar: true,
  },
  ////////////////////////////////////////////////////////////
  // Engagement Specific Routes:
  ////////////////////////////////////////////////////////////
  {
    id: "attendance-display",
    path: "/attendance/display/:sessionId",
    element: <Pages.ActiveSessionDisplay />,
    requiredGroups: [], // Accessible, sidebar rendering is handled dynamically
    sidebar: false,
  },
  {
    id: "attendance-report",
    path: "/attendance/report/:sessionId",
    element: <Pages.AttendanceReport />,
    requiredGroups: [], // Accessible, sidebar rendering is handled dynamically
    sidebar: false,
  },
  {
    id: "tenant-overview",
    path: "/tenant-overview",
    element: <Pages.TenantOverviewPage />,
    title: "Bewohnerübersicht",
    icon: <Groups />,
    requiredGroups: [
      "Heimrat",
      "Inforeferat",
      //"Tutoren",
      "HSV-Vertreter",
      "Zimmerreferat",
      "Finanzenreferat",
      "Schlichtungsreferat",
      //"Aufnahmereferat-Nachruecker",
      "ADMIN",
    ],
    sidebar: true,
  },
  {
    id: "heimrat",
    path: "/heimrat",
    element: <Pages.HeimratPage />,
    title: "Heimrat",
    icon: <FilterVintageOutlined />,
    requiredGroups: ["Heimrat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "attendance-manage",
    path: "/attendance/manage",
    element: <Pages.ManageEventsPage />,
    title: "Anwesenheit verwalten",
    icon: <QrCode2Icon />,
    requiredGroups: [], // Accessible, sidebar rendering is handled dynamically
    sidebar: true,
  },
  {
    id: "attendance-base-overview",
    path: "/attendance/base-attendance/:eventId",
    element: <Pages.BaseAttendanceOverview />,
    requiredGroups: [], // Accessible, sidebar rendering is handled dynamically
    sidebar: false,
  },
  {
    id: "engagement-management",
    path: "/referate",
    element: <Pages.EngagementManagementPage />,
    title: "Referate",
    icon: <GroupWorkOutlined />,
    requiredGroups: ["Heimrat", "Inforeferat", "ADMIN"],
    sidebar: true,
  },
  {
    id: "network",
    path: "/networkdepartment",
    element: <Pages.NetworkDepartmentPage />,
    title: "Netzwerkreferat",
    icon: <LanOutlined />,
    requiredGroups: ["Netzwerkreferat", "ADMIN"],
    sidebar: true,
  },
  //////////////////////////////////////////////////////////////
  // General Routes:
  //////////////////////////////////////////////////////////////
  {
    id: "hsv",
    path: "/hsv",
    element: <Pages.HSVPage />,
    title: "HSV",
    icon: <AssignmentIndOutlinedIcon />,
    requiredGroups: [],
    sidebar: true,
    defaultRedirectOrder: 3,
  },
  {
    id: "not-authorized",
    path: "/not-authorized",
    element: <Pages.Error403Page />,
    requiredGroups: [],
    sidebar: false,
  },
  {
    name: "Unterschriften",
    routes: [
      {
        id: "signatures-tutoren",
        path: "/signatures/tutoren",
        element: <Pages.DepartmentSignaturePage departmentSlug="tutoren" departmentDisplayName="Tutoren" />,
        title: "Auszüge Tutoren",
        icon: <DrawOutlinedIcon />,
        requiredGroups: ["Tutoren", "ADMIN"],
        sidebar: true,
      },
      {
        id: "signatures-bar",
        path: "/signatures/bar",
        element: <Pages.DepartmentSignaturePage departmentSlug="bar" departmentDisplayName="Barreferat" />,
        title: "Auszüge Bar",
        icon: <DrawOutlinedIcon />,
        requiredGroups: ["Barreferat", "ADMIN"],
        sidebar: true,
      },
      {
        id: "signatures-werk",
        path: "/signatures/werk",
        element: <Pages.DepartmentSignaturePage departmentSlug="werk" departmentDisplayName="Werkreferat" />,
        title: "Auszüge Werk",
        icon: <DrawOutlinedIcon />,
        requiredGroups: ["Werkreferat", "ADMIN"],
        sidebar: true,
      },
      {
        id: "signatures-innen",
        path: "/signatures/innen",
        element: <Pages.DepartmentSignaturePage departmentSlug="innen" departmentDisplayName="Innenreferat" />,
        title: "Auszüge Innen",
        icon: <DrawOutlinedIcon />,
        requiredGroups: ["Innenreferat", "ADMIN"],
        sidebar: true,
      },
      {
        id: "signatures-finanzen",
        path: "/signatures/finanzen",
        element: <Pages.DepartmentSignaturePage departmentSlug="finanzen" departmentDisplayName="Finanzenreferat" />,
        title: "Auszüge Finanzen",
        icon: <DrawOutlinedIcon />,
        requiredGroups: ["Finanzenreferat", "ADMIN"],
        sidebar: true,
      },
      ...floorSignatureRoutes,
    ],
  },
];

export const loginRoute = "/login";
export const attendanceCheckInRoute = ATTENDANCE_LINK_ROUTE;
export const defaultAuthenticatedRoute = "/dashboard"; // Fallback if no specific route is found

export const getSidebarItems = (userGroups: string[]): AppRouteItem[] => {
  console.log("Determining sidebar items for user groups:", userGroups);
  return appRoutes.filter((item) => {
    if (!("routes" in item)) {
      return (
        item.sidebar &&
        item.title &&
        item.icon &&
        (!item.requiredGroups ||
          item.requiredGroups.length === 0 ||
          item.requiredGroups.some((group) => userGroups.includes(group)))
      );
    }

    const visibleRoutes = item.routes.filter(
      (route) =>
        route.sidebar &&
        route.title &&
        route.icon &&
        (!route.requiredGroups ||
          route.requiredGroups.length === 0 ||
          route.requiredGroups.some((group) => userGroups.includes(group))),
    );

    if (visibleRoutes.length === 0) return false;

    item.routes = visibleRoutes;
    return true;
  });
};

// Helper function to determine initial redirect path after login (Needed to redirect tenants and departments to their respective dashboards)
export const getInitialRedirectPath = (userGroups: string[]): string => {
  const accessibleRoutes = appRoutes
    .filter((item): item is AppRoute => !("routes" in item))
    .filter(
      (route) =>
        (route.requiredGroups && route.requiredGroups.length === 0) ||
        route.requiredGroups?.some((group) => userGroups.includes(group)),
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
