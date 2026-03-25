import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import { WorkflowPlaceholders } from '@/components/WorkflowPlaceholders';
import AdminPage from '@/pages/AdminPage';
import KategorienPage from '@/pages/KategorienPage';
import BestellungenPage from '@/pages/BestellungenPage';
import VerkaeuferPage from '@/pages/VerkaeuferPage';
import ProduktePage from '@/pages/ProduktePage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<><div className="mb-8"><WorkflowPlaceholders /></div><DashboardOverview /></>} />
            <Route path="kategorien" element={<KategorienPage />} />
            <Route path="bestellungen" element={<BestellungenPage />} />
            <Route path="verkaeufer" element={<VerkaeuferPage />} />
            <Route path="produkte" element={<ProduktePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
