// src/App.tsx
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { CircularProgress, Typography, Box } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import { appRoutes, loginRoute, getInitialRedirectPath } from "./routesConfig";
import Error404Page from "./pages/Error404Page";

const InitialLoadingScreen: React.FC = () => (
  <div className="background">
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2, color: "text.primary" }}>
        Loading application...
      </Typography>
    </Box>
  </div>
);

function App() {
  const { authState } = useAuth();

  if (authState.loading) {
    return <InitialLoadingScreen />;
  }

  return (
    <BrowserRouter>
      {/* Routes are defined in the routesConfig file */}
      <Routes>
        <Route path={loginRoute} element={<LoginPage />} />

        {/* Routes that use AppLayout and require authentication */}
        <Route element={<AppLayout />}>
          {appRoutes.map((route) => (
            <Route key={route.id} element={<ProtectedRoute requiredGroups={route.requiredGroups} />}>
              <Route path={route.path} element={route.element} />
            </Route>
          ))}
          {authState.isAuthenticated && <Route path="*" element={<Error404Page />} />}
        </Route>

        <Route
          path="/"
          element={
            authState.isAuthenticated && authState.user ? (
              <Navigate to={getInitialRedirectPath(authState.user.groups)} replace />
            ) : (
              <Navigate to={loginRoute} replace />
            )
          }
        />

        {!authState.isAuthenticated && <Route path="*" element={<Error404Page />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
