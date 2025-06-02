import React from "react";
import { Box, CardContent, Typography, Paper } from "@mui/material";

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  cardSx?: object;
  contentSx?: object;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, action, cardSx = {}, contentSx = {} }) => (
  <Box sx={{ position: "relative", mt: 2 }}>
    {/* Title Box */}
    {title && (
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: -12,
          left: 20,
          zIndex: 9,
          backgroundColor: "rgb(128, 22, 44);",
          px: 2,
          py: 0.5,
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" color="#f1f1f1">
          {title}
        </Typography>
      </Paper>
    )}

    {/* Main Card */}
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
        pt: 2,
        ...cardSx,
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", ...contentSx }}>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          {action}
        </Box>
        <Box>{children}</Box>
      </CardContent>
    </Paper>
  </Box>
);

export default DashboardCard;
