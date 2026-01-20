/**
 * Protected Route Component
 * Ensures only authenticated admins can access admin routes
 */

import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../utils/adminApi';

function ProtectedRoute({ children }) {
  const isAuthenticated = isAdminLoggedIn();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
