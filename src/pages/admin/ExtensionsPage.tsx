import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import OpenClaimsTable from "../../components/admin/extensions/OpenClaimsTable";
import ProcessingClaimsGrid from "../../components/admin/extensions/ProcessingClaimsGrid";
import CompletedClaimsTable from "../../components/admin/extensions/CompletedClaimsTable";

const ExtensionsPage: React.FC = () => {
  const tabs = [
    {
      label: "Offen",
      content: <OpenClaimsTable />,
    },
    {
      label: "In Bearbeitung",
      content: <ProcessingClaimsGrid />,
    },
    {
      label: "Abgeschlossen",
      content: <CompletedClaimsTable />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Verlängerungen verwalten"
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "100%", padding: 2, overflowY: "auto" }}
      />
    </Box>
  );
};

export default ExtensionsPage;
