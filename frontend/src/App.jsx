import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DealsNK from './pages/DealsNK';
import DealsBK from './pages/DealsBK';
import DealsVL from './pages/DealsVL';
import Employees from './pages/Employees';
import KpiMitarbeiter from './pages/KpiMitarbeiter';
import Auswertung from './pages/Auswertung';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="auftragseingang" element={<Navigate to="/dashboard" replace />} />
        <Route path="neukunden" element={<DealsNK />} />
        <Route path="bestandskunden" element={<DealsBK />} />
        <Route path="verlaengerungen" element={<DealsVL />} />
        <Route path="mitarbeiter" element={<Employees />} />
        <Route path="auswertung" element={<Auswertung />} />
        <Route path="kpi-mitarbeiter" element={<KpiMitarbeiter />} />
        <Route path="einstellungen" element={<Settings />} />
      </Route>
    </Routes>
  );
}
