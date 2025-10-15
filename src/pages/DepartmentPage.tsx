import React from "react";
import { Box } from "@mui/material";
import TenantDataTable from "../components/admin/TenantDataTable";
import TabbedDashboardCard from "../components/shared/TabbedDashboardCard";
import { height } from "@mui/system";

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
      className="page-root"
    >
      <TabbedDashboardCard
        title="Bewohner Übersicht"
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "100%", padding: 2 }}
      ></TabbedDashboardCard>
    </Box>
  );
};

export default DepartmentPage;
