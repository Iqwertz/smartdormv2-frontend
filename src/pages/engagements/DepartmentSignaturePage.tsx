import React from "react";
import { Box } from "@mui/material";
import TabbedDashboardCard from "../../components/shared/TabbedDashboardCard";
import DepartmentSignatureList from "../../components/engagements/DepartmentSignatureList";

interface DepartmentSignaturePageProps {
  departmentSlug: string;
  departmentDisplayName: string;
}

const DepartmentSignaturePage: React.FC<DepartmentSignaturePageProps> = ({ departmentSlug, departmentDisplayName }) => {
  const tabs = [
    {
      label: "Neue Auszüge",
      content: <DepartmentSignatureList departmentSlug={departmentSlug} signed={false} />,
    },
    {
      label: "Unterschriebene Auszüge",
      content: <DepartmentSignatureList departmentSlug={departmentSlug} signed={true} />,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
      <TabbedDashboardCard
        title={`${departmentDisplayName} Signaturen`}
        tabs={tabs}
        cardSx={{
          height: "calc(100dvh - 100px)",
        }}
        contentSx={{ height: "calc(100% - 40px)", padding: 2, overflowY: "auto" }}
      />
    </Box>
  );
};

export default DepartmentSignaturePage;
