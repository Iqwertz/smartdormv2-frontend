import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the custom hook
import { JSX } from '@emotion/react/jsx-runtime';

interface ProtectedRouteProps {
  children: JSX.Element; // The component to render if authenticated
  allowedRoles?: ('admin' | 'tenant')[]; // Optional: Specify allowed roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation(); // Get current location to redirect back after login

  if (isLoading) {
    // Show a loading indicator while checking authentication
    // You can replace this with a proper spinner component
    return <div>Loading authentication status...</div>;
  }

  if (!user) {
    // User not logged in, redirect to login page
    // Pass the current location to redirect back after successful login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Optional: Check for roles if provided
  if (allowedRoles && user.primary_role && !allowedRoles.includes(user.primary_role)) {
     // User is logged in but doesn't have the required role
     // Redirect to login or an "Unauthorized" page
     console.warn(`User ${user.username} does not have required roles: ${allowedRoles}. Has role: ${user.primary_role}`);
     // You might want a dedicated /unauthorized page instead of redirecting to login
     return <Navigate to="/" state={{ from: location }} replace />; // Redirecting to login for simplicity
  }

  // User is authenticated (and has the right role, if checked)
  return children;
};

export default ProtectedRoute;