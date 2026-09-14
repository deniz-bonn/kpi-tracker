import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Startseite nach dem Login bzw. auf "/".
//
// NK-Vertriebler landen auf "Mein Dashboard" — das ist ihre Arbeitsseite (Provision, eigene Deals,
// Incentive). Alle anderen Rollen behalten das bestehende Dashboard.
// Solange die Feature-Flags noch laden, wird NICHT entschieden: sonst leitet die Seite kurz aufs
// Dashboard und springt danach weg (dasselbe Muster wie in ProtectedRoute).
export default function Startseite() {
  const { user, canSeeMeinDashboard, featureFlagsGeladen } = useAuth();
  if (user && user.role === 'nk_vertrieb' && !featureFlagsGeladen) {
    return <div className="text-sm text-gray-400 py-10 text-center">Lade…</div>;
  }
  const ziel = (user?.role === 'nk_vertrieb' && canSeeMeinDashboard) ? '/mein-dashboard' : '/dashboard';
  return <Navigate to={ziel} replace />;
}
