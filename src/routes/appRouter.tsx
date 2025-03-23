// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/authContext";
import Login from "../pages/login";
import Admin from "../pages/admin";
import Tenant from "../pages/tenant";
import ProtectedRoute from "./protectedRoute";

const AppRouter = () => (
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/tenant" element={<ProtectedRoute><Tenant /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </Router>
);

export default AppRouter;
