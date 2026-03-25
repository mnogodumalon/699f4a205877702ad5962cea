import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import VerkaeuferPage from '@/pages/VerkaeuferPage';
import BestellungenPage from '@/pages/BestellungenPage';
import KategorienPage from '@/pages/KategorienPage';
import ProduktePage from '@/pages/ProduktePage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="verkaeufer" element={<VerkaeuferPage />} />
            <Route path="bestellungen" element={<BestellungenPage />} />
            <Route path="kategorien" element={<KategorienPage />} />
            <Route path="produkte" element={<ProduktePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
