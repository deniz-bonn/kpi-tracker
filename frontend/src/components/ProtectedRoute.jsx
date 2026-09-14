import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, canAccess }) {
  const { user, isSuperAdmin, featureFlagsGeladen } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Superadmin bypasses role restrictions
  if (allowedRoles && !isSuperAdmin && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Feature-gesteuerte Routen: canAccess ist erst aussagekraeftig, wenn die Flags geladen sind.
  // Vorher ist es faelschlich false — wer direkt aufruft oder F5 drueckt (Lesezeichen!), wurde
  // deshalb aufs Dashboard geworfen, obwohl er Zugriff hat. Also warten statt umleiten.
  // Nur wenn der Zugriff aktuell verneint wird: bei true (z.B. Superadmin) gibt es nichts zu warten.
  if (canAccess !== undefined && !canAccess && !featureFlagsGeladen) {
    return <div className="text-sm text-gray-400 py-10 text-center">Lade…</div>;
  }
  if (canAccess !== undefined && !canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
