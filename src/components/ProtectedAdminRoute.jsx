import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export const ProtectedAdminRoute = ({ children }) => {
  const { user, userRole } = useAuth();

  // If not authenticated or no role, redirect to login
  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have admin role, redirect to home
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // User is admin, render the admin page
  return children;
};
