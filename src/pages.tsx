import React from "react";

// This file is dedicated to defining and exporting lazy-loaded page components.
// This keeps our route configuration clean and ensures Fast Refresh works correctly.

export const TenantPage = React.lazy(() => import("./pages/TenantPage"));
export const DepartmentPage = React.lazy(() => import("./pages/DepartmentPage"));
export const HSVPage = React.lazy(() => import("./pages/shared/HSVPage"));
export const ParcelPage = React.lazy(() => import("./pages/admin/ParcelPage"));
export const Error403Page = React.lazy(() => import("./pages/Error403Page"));
export const HeimratPage = React.lazy(() => import("./pages/engagements/HeimratPage"));
export const NewTenantPage = React.lazy(() => import("./pages/admin/NewTenantPage"));
export const EditTenantPage = React.lazy(() => import("./pages/admin/EditTenantPage"));
export const EditSubtenantPage = React.lazy(() => import("./pages/admin/EditSubtenantPage"));
export const NewSubtenantPage = React.lazy(() => import("./pages/admin/NewSubtenantPage"));
export const SubtenantPage = React.lazy(() => import("./pages/admin/SubtenantPage"));
export const SubtenantDashboardPage = React.lazy(() => import("./pages/subtenants/SubtenantDashboardPage"));
export const DepartmentSignaturePage = React.lazy(() => import("./pages/engagements/DepartmentSignaturePage"));
export const DeparturesPage = React.lazy(() => import("./pages/admin/DeparturesPage"));
export const ExtensionsPage = React.lazy(() => import("./pages/admin/ExtensionsPage"));
export const ApplyEngagementPage = React.lazy(() => import("./pages/tenants/ApplyEngagementPage"));
export const ViewApplicationsPage = React.lazy(() => import("./pages/tenants/ViewApplicationsPage"));
export const EngagementManagementPage = React.lazy(() => import("./pages/engagements/EngagementManagementPage"));
export const TenantOverviewPage = React.lazy(() => import("./pages/engagements/TenantOverviewPage"));
export const NetworkDepartmentPage = React.lazy(() => import("./pages/engagements/NetworkDepartmentPage"));
export const PrintPage = React.lazy(() => import("./pages/tenants/PrintPage"));
export const PrintingAdminPage = React.lazy(() => import("./pages/admin/PrintingAdminPage"));

// Also move any other component definitions here for consistency.
export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div>
    <h2>{title}</h2>
    <p>Not implemented, will be implemented in the future.</p>
  </div>
);

export const ManageEventsPage = React.lazy(() => import("./pages/engagements/ManageEventsPage"));
export const ActiveSessionDisplay = React.lazy(() => import("./pages/engagements/ActiveSessionDisplayPage"));
export const AttendanceCheckInPage = React.lazy(() => import("./pages/engagements/AttendanceCheckInPage"));
export const AttendanceReport = React.lazy(() => import("./pages/engagements/AttendanceReportPage"));
export const BaseAttendanceOverview = React.lazy(() => import("./pages/engagements/BaseAttendanceOverviewPage"));
