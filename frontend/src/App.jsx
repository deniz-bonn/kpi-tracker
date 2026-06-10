import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import Dashboard from './pages/Dashboard';
import DealsNK from './pages/DealsNK';
import DealsBK from './pages/DealsBK';
import DealsVL from './pages/DealsVL';
import Employees from './pages/Employees';
import KpiMitarbeiter from './pages/KpiMitarbeiter';
import Auswertung from './pages/Auswertung';
import Settings from './pages/Settings';

const ROLES = {
  all:        ['admin', 'nk_vertrieb', 'bk_vertrieb', 'backoffice'],
  nkAndAbove: ['admin', 'nk_vertrieb', 'bk_vertrieb', 'backoffice'],
  bkAndAbove: ['admin', 'bk_vertrieb', 'backoffice'],
  adminAndBo: ['admin', 'backoffice'],
  adminOnly:  ['admin'],
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="auftragseingang" element={<Navigate to="/dashboard" replace />} />

          <Route path="neukunden" element={
            <ProtectedRoute allowedRoles={ROLES.nkAndAbove}>
              <DealsNK />
            </ProtectedRoute>
          } />
          <Route path="bestandskunden" element={
            <ProtectedRoute allowedRoles={ROLES.bkAndAbove}>
              <DealsBK />
            </ProtectedRoute>
          } />
          <Route path="verlaengerungen" element={
            <ProtectedRoute allowedRoles={ROLES.bkAndAbove}>
              <DealsVL />
            </ProtectedRoute>
          } />

          <Route path="auswertung" element={
            <ProtectedRoute allowedRoles={ROLES.adminAndBo}>
              <Auswertung />
            </ProtectedRoute>
          } />
          <Route path="kpi-mitarbeiter" element={
            <ProtectedRoute allowedRoles={ROLES.adminAndBo}>
              <KpiMitarbeiter />
            </ProtectedRoute>
          } />
          <Route path="mitarbeiter" element={
            <ProtectedRoute allowedRoles={ROLES.adminAndBo}>
              <Employees />
            </ProtectedRoute>
          } />
          <Route path="einstellungen" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
