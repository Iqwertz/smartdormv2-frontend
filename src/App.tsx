// src/App.tsx
import React, { Suspense } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { CircularProgress, Typography, Box } from "@mui/material";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layout/AppLayout";
import { appRoutes, loginRoute, getInitialRedirectPath, AppRouteGroup, AppRoute } from "./routesConfig";
import { useTracking } from "./hooks/useTracking";

// Lazy load pages that are not in the main appRoutes array
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const PasswordResetPage = React.lazy(() => import("./pages/PasswordResetPage"));
const Error404Page = React.lazy(() => import("./pages/Error404Page"));

const InitialLoadingScreen: React.FC = () => (
  <div className="background">
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
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

// A fallback component to show while lazy-loaded pages are being fetched
const SuspenseFallback: React.FC = () => (
  <div className="background">
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  </div>
);

function App() {
  const { authState } = useAuth();
  useTracking();

  if (authState.loading) {
    return <InitialLoadingScreen />;
  }

  return (
    <BrowserRouter>
      {/* Wrap all Routes in a Suspense component to handle lazy loading */}
      <Suspense fallback={<SuspenseFallback />}>
        {/* Routes are defined in the routesConfig.tsx file */}
        <Routes>
          <Route path={loginRoute} element={<LoginPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />

          {/* Routes that use AppLayout and require authentication */}
          <Route element={<AppLayout />}>
            {appRoutes.map((item) => {
              // Check if item is a route group
              if ("routes" in item) {
                // It's an AppRouteGroup
                return (item as AppRouteGroup).routes.map((route) => (
                  <Route key={route.id} element={<ProtectedRoute requiredGroups={route.requiredGroups} />}>
                    <Route path={route.path} element={route.element} />
                  </Route>
                ));
              } else {
                // It's a single AppRoute
                const route = item as AppRoute;
                return (
                  <Route key={route.id} element={<ProtectedRoute requiredGroups={route.requiredGroups} />}>
                    <Route path={route.path} element={route.element} />
                  </Route>
                );
              }
            })}
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
