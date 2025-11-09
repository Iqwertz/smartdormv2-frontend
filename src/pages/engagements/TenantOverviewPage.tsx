// src/pages/engagements/TenantOverviewPage.tsx
import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import TenantEngagementTable from "../../components/engagements/TenantEngagementTable";
import EngagementTenantTable from "../../components/engagements/EngagementTenantTable";
import TenantExport from "../../components/engagements/TenantExport";
import TenantEngagementTableMinimal from "../../components/engagements/TenantEngagementTableMinimal";

const TenantOverviewPage: React.FC = () => {
  const tabs = [
    {
      label: "Bewohner Übersicht",
      content: <TenantEngagementTable />,
      authGroups: ["ADMIN", "Heimrat", "Inforeferat", "Zimmerreferat", "Finanzenreferat", "Schlichtungsreferat"],
    },
    {
      label: "Download",
      content: <TenantExport />,
      authGroups: ["ADMIN", "Heimrat", "Inforeferat", "Zimmerreferat", "Finanzenreferat", "Schlichtungsreferat"],
    },
    {
      label: "Referate Übersicht",
      content: <EngagementTenantTable />,
      authGroups: ["ADMIN", "Heimrat", "Inforeferat", "Zimmerreferat", "Finanzenreferat", "Schlichtungsreferat"],
    },
    {
      label: "HSV-Vertreter",
      content: <TenantEngagementTableMinimal />,
      authGroups: ["ADMIN", "HSV-Vertreter"],
    },
  ];

  return (
    <Box sx={{ maxWidth: "1600px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Referate & Bewohner"
        tabs={tabs}
        cardSx={{
          height: "calc(100vh - 64px - 3rem - 16px)",
        }}
        contentSx={{ height: "calc(100% - 40px)", padding: 2, overflowY: "auto" }}
      />
    </Box>
  );
};

export default TenantOverviewPage;
