import React from "react";
import { Box } from "@mui/material";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";
import "../../styles/bento-layout.scss";

const HeimratPage: React.FC = () => {
  return (
    <Box sx={{ px: 1, py: 1 }}>
      {" "}
      <div className="grid">
        <div className="left"></div>
        <div className="right">
          <DashboardCard title="Einstellungen">
            <p>Not implemented, will be implemented in the future.</p>
          </DashboardCard>
        </div>
      </div>
    </Box>
  );
};

export default HeimratPage;
