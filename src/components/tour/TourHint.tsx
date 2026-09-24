import React from "react";
import { Typography } from "@mui/material";

/** The one line of a tour step that a new tenant should remember if they remember nothing else. */
const TourHint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: "primary.main" }}>
    {children}
  </Typography>
);

export default TourHint;
