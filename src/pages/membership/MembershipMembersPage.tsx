import React from "react";
import { Box } from "@mui/material";
import DashboardCard from "../../components/shared/DashboardCard";
import MembersDataTable from "../../components/membership/MembersDataTable";

/** The HSV member register: Beitrittsdatum, Mandatsnummer, IBAN and the SEPA collection run. */
const MembershipMembersPage: React.FC = () => (
  <Box sx={{ maxWidth: "1500px", margin: "0 auto" }} className="page-root">
    <DashboardCard
      title="Mitglieder"
      cardSx={{ height: "calc(100dvh - 100px)" }}
      contentSx={{ height: "100%", padding: 2, display: "flex", flexDirection: "column" }}
    >
      <MembersDataTable />
    </DashboardCard>
  </Box>
);

export default MembershipMembersPage;
