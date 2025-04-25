// src/App.tsx
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import TenantPage from "./pages/TenantPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute requiredUserType={["TENANT"]} />}>
          <Route path="/tenant" element={<TenantPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredUserType={["DEPARTMENT"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Example Role Protected Route */}
        {/*        <Route element={<ProtectedRoute
                requiredUserType={['TENANT']}
                requiredRoles={['tenant', 'wiki']}
              />
            }
          >
            <Route path="/tenant-wiki" element={<div>wiki</div>} />
          </Route> */}

        {/* Default Route */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
