import React, { useState } from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import OpenApplicationsGrid from "../../components/membership/OpenApplicationsGrid";
import DecidedApplicationsTable from "../../components/membership/DecidedApplicationsTable";

/** Review of HSV Beitrittsanträge for Zimmerreferat, Finanzenreferat and Heimrat. */
const MembershipApplicationsPage: React.FC = () => {
  // Bumping this remounts the decided tables so a fresh decision shows up there immediately.
  const [decidedCount, setDecidedCount] = useState(0);

  const tabs = [
    { label: "Offen", content: <OpenApplicationsGrid onDecided={() => setDecidedCount((c) => c + 1)} /> },
    { label: "Genehmigt", content: <DecidedApplicationsTable key={`a-${decidedCount}`} status="APPROVED" /> },
    { label: "Abgelehnt", content: <DecidedApplicationsTable key={`r-${decidedCount}`} status="REJECTED" /> },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Mitgliedsanträge"
        tabs={tabs}
        cardSx={{ height: "calc(100dvh - 100px)" }}
        contentSx={{ height: "100%", padding: 2, overflowY: "auto" }}
      />
    </Box>
  );
};

export default MembershipApplicationsPage;
