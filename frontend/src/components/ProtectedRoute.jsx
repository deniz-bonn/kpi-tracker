import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, canAccess }) {
  const { user, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypasses role restrictions
  if (allowedRoles && !isSuperAdmin && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Feature-gated routes
  if (canAccess !== undefined && !canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
