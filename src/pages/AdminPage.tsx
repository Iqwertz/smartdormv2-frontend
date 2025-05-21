import React from "react";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";
import TenantDataTable from "../components/admin/TenantDataTable";

const AdminPage: React.FC = () => {
  return (
    <div
      className="container"
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <DashboardCard
        title="Bewohner Übersicht"
        cardSx={{ flexGrow: 1, height: "calc(100% - 16px)" }}
        contentSx={{ height: "calc(100% - 40px)" }}
      >
        <TenantDataTable />
      </DashboardCard>
    </div>
  );
};

export default AdminPage;
