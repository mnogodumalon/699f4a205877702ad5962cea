import type { Bestellungen, Produkte } from './app';

export type EnrichedProdukte = Produkte & {
  kategorieName: string;
  verkaeuferName: string;
};

export type EnrichedBestellungen = Bestellungen & {
  produkteName: string;
};
