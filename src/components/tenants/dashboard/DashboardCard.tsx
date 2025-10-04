import React from "react";
import { Box, CardContent, Typography, Paper } from "@mui/material";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  cardSx?: object;
  contentSx?: object;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, action, cardSx = {}, contentSx = {} }) => (
  <Paper
    elevation={6}
    sx={{
      position: "relative",
      zIndex: 2,
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderRadius: 2,
      overflow: "hidden",
      ...cardSx,
    }}
  >
    <CardContent sx={{ display: "flex", flexDirection: "column", ...contentSx }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" color="text.primary">
          {title}
        </Typography>
        {action}
      </Box>
      <Box>{children}</Box>
    </CardContent>
  </Paper>
);

export default DashboardCard;
