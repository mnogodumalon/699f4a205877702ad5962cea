// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Kategorien {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategorie_name?: string;
    kategorie_beschreibung?: string;
  };
}

export interface Verkaeufer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    firma_name?: string;
    kontakt_vorname?: string;
    kontakt_nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
    beschreibung?: string;
  };
}

export interface Produkte {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    produkt_name?: string;
    produkt_beschreibung?: string;
    preis?: number;
    kategorie?: string; // applookup -> URL zu 'Kategorien' Record
    verkaeufer?: string; // applookup -> URL zu 'Verkaeufer' Record
    verfuegbar?: boolean;
    produktbilder?: string;
  };
}

export interface Bestellungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    produkte?: string; // applookup -> URL zu 'Produkte' Record
    kaeufer_vorname?: string;
    kaeufer_nachname?: string;
    kaeufer_email?: string;
    kaeufer_telefon?: string;
    liefer_strasse?: string;
    liefer_hausnummer?: string;
    liefer_postleitzahl?: string;
    liefer_stadt?: string;
    bestelldatum?: string; // Format: YYYY-MM-DD oder ISO String
    gesamtbetrag?: number;
    bestellstatus?: 'neu' | 'in_bearbeitung' | 'versendet' | 'zugestellt' | 'storniert';
  };
}

export const APP_IDS = {
  KATEGORIEN: '699f4a00aec743a67b58a7ce',
  VERKAEUFER: '699f4a06f429752b6030c846',
  PRODUKTE: '699f4a0798760968fa3378a6',
  BESTELLUNGEN: '699f4a083f72e014fbc6f8ea',
} as const;

// Helper Types for creating new records
export type CreateKategorien = Kategorien['fields'];
export type CreateVerkaeufer = Verkaeufer['fields'];
export type CreateProdukte = Produkte['fields'];
export type CreateBestellungen = Bestellungen['fields'];