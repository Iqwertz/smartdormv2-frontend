import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import DepartureCandidatesTable from "../../components/admin/departures/DepartureCandidatesTable";
import PendingDeparturesList from "../../components/admin/departures/PendingDeparturesList";
import ClosedDeparturesTable from "../../components/admin/departures/ClosedDeparturesTable";

const DeparturesPage: React.FC = () => {
  // We use a key on the components to force re-mount and data refresh when switching tabs
  const tabs = [
    { label: "Auszugskandidaten", content: <DepartureCandidatesTable key="candidates" /> },
    { label: "Laufende Auszüge", content: <PendingDeparturesList key="pending" /> },
    { label: "Abgeschlossene Auszüge", content: <ClosedDeparturesTable key="closed" /> },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title="Auszugsmanagement"
        tabs={tabs}
        cardSx={{
          height: "calc(100vh - 64px - 3rem - 16px)",
        }}
        contentSx={{ height: "calc(100% - 40px)", padding: 2 }}
      />
    </Box>
  );
};

export default DeparturesPage;
