import type { EnrichedBestellungen, EnrichedProdukte } from '@/types/enriched';
import type { Bestellungen, Kategorien, Produkte, Verkaeufer } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: string | undefined, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface ProdukteMaps {
  kategorienMap: Map<string, Kategorien>;
  verkaeuferMap: Map<string, Verkaeufer>;
}

export function enrichProdukte(
  produkte: Produkte[],
  maps: ProdukteMaps
): EnrichedProdukte[] {
  return produkte.map(r => ({
    ...r,
    kategorieName: resolveDisplay(r.fields.kategorie, maps.kategorienMap, 'kategorie_name'),
    verkaeuferName: resolveDisplay(r.fields.verkaeufer, maps.verkaeuferMap, 'firma_name'),
  }));
}

interface BestellungenMaps {
  produkteMap: Map<string, Produkte>;
}

export function enrichBestellungen(
  bestellungen: Bestellungen[],
  maps: BestellungenMaps
): EnrichedBestellungen[] {
  return bestellungen.map(r => ({
    ...r,
    produkteName: resolveDisplay(r.fields.produkte, maps.produkteMap, 'produkt_name'),
  }));
}
