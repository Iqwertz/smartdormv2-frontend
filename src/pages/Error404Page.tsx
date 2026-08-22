import React from "react";
import { Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "../context/AuthContext";
import { getInitialRedirectPath, loginRoute } from "../routesConfig";
import DashboardCard from "../components/shared/DashboardCard";

const Error404Page: React.FC = () => {
  const { authState } = useAuth();

  const goHomePath =
    authState.isAuthenticated && authState.user ? getInitialRedirectPath(authState.user) : loginRoute;

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
      <Typography
        variant="h1"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700, fontSize: { xs: "6rem", md: "8rem" } }}
      >
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Seite nicht gefunden
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: "500px" }}>
        Entschuldigung, die Seite, die Sie suchen, existiert nicht oder wurde verschoben.
      </Typography>
      <Button variant="contained" color="primary" component={RouterLink} to={goHomePath} startIcon={<HomeIcon />}>
        Zur Startseite
      </Button>
    </DashboardCard>
  );
};

export default Error404Page;
