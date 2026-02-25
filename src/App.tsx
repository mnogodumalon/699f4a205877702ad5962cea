import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import KategorienPage from '@/pages/KategorienPage';
import VerkaeuferPage from '@/pages/VerkaeuferPage';
import ProduktePage from '@/pages/ProduktePage';
import BestellungenPage from '@/pages/BestellungenPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="kategorien" element={<KategorienPage />} />
          <Route path="verkaeufer" element={<VerkaeuferPage />} />
          <Route path="produkte" element={<ProduktePage />} />
          <Route path="bestellungen" element={<BestellungenPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}