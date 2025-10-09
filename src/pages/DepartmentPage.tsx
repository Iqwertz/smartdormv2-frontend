import React from "react";
import { Box } from "@mui/material";
import TenantDataTable from "../components/admin/TenantDataTable";
import TabbedDashboardCard from "../components/shared/TabbedDashboardCard";

const DepartmentPage: React.FC = () => {
  const tabs = [
    {
      label: "Aktuell",
      content: <TenantDataTable status="current" />,
    },
    {
      label: "Ehemalig",
      content: <TenantDataTable status="past" />,
    },
    {
      label: "Zukünftig",
      content: <TenantDataTable status="future" />,
    },
    {
      label: "Alle",
      content: <TenantDataTable status="all" />,
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: "1300px",
        margin: "0 auto",
      }}
    >
      <TabbedDashboardCard
        title="Bewohner Übersicht"
        tabs={tabs}
        cardSx={{
          height: "calc(100vh - 64px - 3rem - 16px)",
        }}
        contentSx={{ height: "calc(100% - 40px)", padding: 2, overflowY: "auto" }}
      ></TabbedDashboardCard>
    </Box>
  );
};

export default DepartmentPage;
