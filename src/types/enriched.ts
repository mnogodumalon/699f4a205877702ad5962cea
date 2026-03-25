import type { Bestellungen, Produkte } from './app';

export type EnrichedBestellungen = Bestellungen & {
  produkteName: string;
};

export type EnrichedProdukte = Produkte & {
  kategorieName: string;
  verkaeuferName: string;
};
