import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import DepartureCandidatesTable from "../../components/admin/departures/DepartureCandidatesTable";
import OpenDeparturesTable from "../../components/admin/departures/OpenDeparturesTable";
import ConfirmedDeparturesList from "../../components/admin/departures/ConfirmedDeparturesList";
import ClosedDeparturesTable from "../../components/admin/departures/ClosedDeparturesTable";

const DeparturesPage: React.FC = () => {
  const tabs = [
    {
      label: "Auszugskandidaten",
      content: <DepartureCandidatesTable />,
    },
    {
      label: "Offene Anträge",
      content: <OpenDeparturesTable />,
    },
    {
      label: "Auszügler",
      content: <ConfirmedDeparturesList />,
    },
    {
      label: "Erledigte Anträge",
      content: <ClosedDeparturesTable />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title="Auszüge verwalten"
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "100%", padding: 2, overflowY: "auto" }}
      />
    </Box>
  );
};

export default DeparturesPage;
