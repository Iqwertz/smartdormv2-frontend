import React from "react";
import { Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GppBadIcon from "@mui/icons-material/GppBad"; // Forbidden icon
import { useAuth } from "../context/AuthContext";
import { getInitialRedirectPath } from "../routesConfig";
import DashboardCard from "../components/tenants/dashboard/DashboardCard";

const Error403Page: React.FC = () => {
  const { authState } = useAuth();

  const goHomePath = authState.user ? getInitialRedirectPath(authState.user.groups) : "/dashboard";

  return (
    <DashboardCard
      contentSx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      cardSx={{
        width: { xs: "90%", sm: "80%", md: "60%" },
        mx: "auto",
      }}
    >
      <GppBadIcon sx={{ fontSize: { xs: "5rem", md: "7rem" }, color: "primary.main", mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Zugriff verweigert
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Du hast nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
        <br />
        <br />
        Wenn du denkst, dass dies ein Fehler ist, kontaktiere bitte die Netzwerkreferenten.
      </Typography>
      <Button variant="contained" color="primary" component={RouterLink} to={goHomePath} startIcon={<HomeIcon />}>
        Zurück zur Startseite
      </Button>
    </DashboardCard>
  );
};

export default Error403Page;
