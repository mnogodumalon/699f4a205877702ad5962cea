import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kategorien, Verkaeufer, Produkte, Bestellungen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [kategorien, setKategorien] = useState<Kategorien[]>([]);
  const [verkaeufer, setVerkaeufer] = useState<Verkaeufer[]>([]);
  const [produkte, setProdukte] = useState<Produkte[]>([]);
  const [bestellungen, setBestellungen] = useState<Bestellungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [kategorienData, verkaeuferData, produkteData, bestellungenData] = await Promise.all([
        LivingAppsService.getKategorien(),
        LivingAppsService.getVerkaeufer(),
        LivingAppsService.getProdukte(),
        LivingAppsService.getBestellungen(),
      ]);
      setKategorien(kategorienData);
      setVerkaeufer(verkaeuferData);
      setProdukte(produkteData);
      setBestellungen(bestellungenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  return { kategorien, setKategorien, verkaeufer, setVerkaeufer, produkte, setProdukte, bestellungen, setBestellungen, loading, error, fetchAll, kategorienMap, verkaeuferMap, produkteMap };
}