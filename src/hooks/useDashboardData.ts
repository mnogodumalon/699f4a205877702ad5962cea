import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Verkaeufer, Bestellungen, Kategorien, Produkte } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [verkaeufer, setVerkaeufer] = useState<Verkaeufer[]>([]);
  const [bestellungen, setBestellungen] = useState<Bestellungen[]>([]);
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [produkte, setProdukte] = useState<Produkte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [verkaeuferData, bestellungenData, kategorienData, produkteData] = await Promise.all([
        LivingAppsService.getVerkaeufer(),
        LivingAppsService.getBestellungen(),
        LivingAppsService.getKategorien(),
        LivingAppsService.getProdukte(),
      ]);
      setVerkaeufer(verkaeuferData);
      setBestellungen(bestellungenData);
      setKategorien(kategorienData);
      setProdukte(produkteData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [verkaeuferData, bestellungenData, kategorienData, produkteData] = await Promise.all([
          LivingAppsService.getVerkaeufer(),
          LivingAppsService.getBestellungen(),
          LivingAppsService.getKategorien(),
          LivingAppsService.getProdukte(),
        ]);
        setVerkaeufer(verkaeuferData);
        setBestellungen(bestellungenData);
        setKategorien(kategorienData);
        setProdukte(produkteData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const verkaeuferMap = useMemo(() => {
    const m = new Map<string, Verkaeufer>();
    verkaeufer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [verkaeufer]);

  const kategorienMap = useMemo(() => {
    const m = new Map<string, Kategorien>();
    kategorien.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kategorien]);

  const produkteMap = useMemo(() => {
    const m = new Map<string, Produkte>();
    produkte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [produkte]);

  return { verkaeufer, setVerkaeufer, bestellungen, setBestellungen, kategorien, setKategorien, produkte, setProdukte, loading, error, fetchAll, verkaeuferMap, kategorienMap, produkteMap };
}