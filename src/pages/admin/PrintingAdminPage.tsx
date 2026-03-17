import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import DeviceOverviewTab from "../../components/admin/printing/DeviceOverviewTab";
import DeviceSettingsTab from "../../components/admin/printing/DeviceSettingsTab";
import TenantBillingTab from "../../components/admin/printing/TenantBillingTab";

const PrintingAdminPage: React.FC = () => {
  const tabs = [
    {
      label: "Übersicht",
      content: <DeviceOverviewTab />,
    },
    {
      label: "Einstellungen",
      content: <DeviceSettingsTab />,
    },
    {
      label: "Abrechnung",
      content: <TenantBillingTab />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Drucker verwalten"
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "100%", padding: 2, overflowY: "auto", overflowX: "auto" }}
      />
    </Box>
  );
};

export default PrintingAdminPage;

