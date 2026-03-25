// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

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
    bestellstatus?: LookupValue;
  };
}

export interface Kategorien {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategorie_name?: string;
    kategorie_beschreibung?: string;
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

export const APP_IDS = {
  VERKAEUFER: '699f4a06f429752b6030c846',
  BESTELLUNGEN: '699f4a083f72e014fbc6f8ea',
  KATEGORIEN: '699f4a00aec743a67b58a7ce',
  PRODUKTE: '699f4a0798760968fa3378a6',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'bestellungen': {
    bestellstatus: [{ key: "neu", label: "Neu" }, { key: "in_bearbeitung", label: "In Bearbeitung" }, { key: "versendet", label: "Versendet" }, { key: "zugestellt", label: "Zugestellt" }, { key: "storniert", label: "Storniert" }],
  },
};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'verkaeufer': {
    'firma_name': 'string/text',
    'kontakt_vorname': 'string/text',
    'kontakt_nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'postleitzahl': 'string/text',
    'stadt': 'string/text',
    'beschreibung': 'string/textarea',
  },
  'bestellungen': {
    'produkte': 'applookup/select',
    'kaeufer_vorname': 'string/text',
    'kaeufer_nachname': 'string/text',
    'kaeufer_email': 'string/email',
    'kaeufer_telefon': 'string/tel',
    'liefer_strasse': 'string/text',
    'liefer_hausnummer': 'string/text',
    'liefer_postleitzahl': 'string/text',
    'liefer_stadt': 'string/text',
    'bestelldatum': 'date/date',
    'gesamtbetrag': 'number',
    'bestellstatus': 'lookup/select',
  },
  'kategorien': {
    'kategorie_name': 'string/text',
    'kategorie_beschreibung': 'string/textarea',
  },
  'produkte': {
    'produkt_name': 'string/text',
    'produkt_beschreibung': 'string/textarea',
    'preis': 'number',
    'kategorie': 'applookup/select',
    'verkaeufer': 'applookup/select',
    'verfuegbar': 'bool',
    'produktbilder': 'file',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVerkaeufer = StripLookup<Verkaeufer['fields']>;
export type CreateBestellungen = StripLookup<Bestellungen['fields']>;
export type CreateKategorien = StripLookup<Kategorien['fields']>;
export type CreateProdukte = StripLookup<Produkte['fields']>;