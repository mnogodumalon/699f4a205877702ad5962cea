import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kategorien, Bestellungen, Verkaeufer, Produkte } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [bestellungen, setBestellungen] = useState<Bestellungen[]>([]);
  const [verkaeufer, setVerkaeufer] = useState<Verkaeufer[]>([]);
  const [produkte, setProdukte] = useState<Produkte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [kategorienData, bestellungenData, verkaeuferData, produkteData] = await Promise.all([
        LivingAppsService.getKategorien(),
        LivingAppsService.getBestellungen(),
        LivingAppsService.getVerkaeufer(),
        LivingAppsService.getProdukte(),
      ]);
      setKategorien(kategorienData);
      setBestellungen(bestellungenData);
      setVerkaeufer(verkaeuferData);
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
        const [kategorienData, bestellungenData, verkaeuferData, produkteData] = await Promise.all([
          LivingAppsService.getKategorien(),
          LivingAppsService.getBestellungen(),
          LivingAppsService.getVerkaeufer(),
          LivingAppsService.getProdukte(),
        ]);
        setKategorien(kategorienData);
        setBestellungen(bestellungenData);
        setVerkaeufer(verkaeuferData);
        setProdukte(produkteData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const kategorienMap = useMemo(() => {
    const m = new Map<string, Kategorien>();
    kategorien.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kategorien]);

  const verkaeuferMap = useMemo(() => {
    const m = new Map<string, Verkaeufer>();
    verkaeufer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [verkaeufer]);

  const produkteMap = useMemo(() => {
    const m = new Map<string, Produkte>();
    produkte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [produkte]);

  return { kategorien, setKategorien, bestellungen, setBestellungen, verkaeufer, setVerkaeufer, produkte, setProdukte, loading, error, fetchAll, kategorienMap, verkaeuferMap, produkteMap };
}