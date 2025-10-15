import React from "react";
import { Box } from "@mui/material";

import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import SubtenantDataTable from "../../components/admin/SubtenantDataTable";

const SubtenantPage: React.FC = () => {
  const tabs = [
    {
      label: "Aktuelle",
      content: <SubtenantDataTable status="current" />,
    },
    {
      label: "Zukünftige",
      content: <SubtenantDataTable status="future" />,
    },
    {
      label: "Alle",
      content: <SubtenantDataTable status="all" />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1300px", margin: "0 auto" }} className="page-root">
      <TabbedDashboardCard
        title="Untermieter"
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "calc(100% - 40px)", padding: 2 }}
      />
    </Box>
  );
};

export default SubtenantPage;
