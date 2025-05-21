// src/App.tsx
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material"; // Import components for loading indicator
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import TenantPage from "./pages/TenantPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HSVPage from "./pages/shared/HSVPage";
import { useAuth } from "./context/AuthContext"; // Import useAuth
import TenantLayout from "./layout/TenantLayout";
import AdminLayout from "./layout/AdminLayout";
import ParcelPage from "./pages/admin/ParcelPage";

// Simple component for the initial loading state
const InitialLoadingScreen: React.FC = () => (
  <div className="background">
    <CircularProgress />
    <Typography variant="body1" sx={{ mt: 2 }}>
      Loading application...
    </Typography>
  </div>
);

function App() {
  const { authState } = useAuth();
  if (authState.loading) {
    return <InitialLoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Tenant Routes */}
        <Route element={<ProtectedRoute requiredUserType={["TENANT"]} />}>
          <Route element={<TenantLayout />}>
            <Route path="/tenant" element={<TenantPage />} />
            <Route path="/tenant/hsv" element={<HSVPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredUserType={["DEPARTMENT"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/hsv" element={<HSVPage />} />
            <Route path="/admin/parcels" element={<ParcelPage />} />
          </Route>
        </Route>

        {/* Default Route */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
