// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Kategorien, Verkaeufer, Produkte, Bestellungen } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

/** Upload a file to LivingApps. Returns the file URL for use in record fields. */
export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename ?? (file instanceof File ? file.name : 'upload'));
  const res = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}

export class LivingAppsService {
  // --- KATEGORIEN ---
  static async getKategorien(): Promise<Kategorien[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKategorienEntry(id: string): Promise<Kategorien | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKategorienEntry(fields: Kategorien['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KATEGORIEN}/records`, { fields });
  }
  static async updateKategorienEntry(id: string, fields: Partial<Kategorien['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`, { fields });
  }
  static async deleteKategorienEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
  }

  // --- VERKAEUFER ---
  static async getVerkaeufer(): Promise<Verkaeufer[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.VERKAEUFER}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getVerkaeuferEntry(id: string): Promise<Verkaeufer | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.VERKAEUFER}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createVerkaeuferEntry(fields: Verkaeufer['fields']) {
    return callApi('POST', `/apps/${APP_IDS.VERKAEUFER}/records`, { fields });
  }
  static async updateVerkaeuferEntry(id: string, fields: Partial<Verkaeufer['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.VERKAEUFER}/records/${id}`, { fields });
  }
  static async deleteVerkaeuferEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.VERKAEUFER}/records/${id}`);
  }

  // --- PRODUKTE ---
  static async getProdukte(): Promise<Produkte[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.PRODUKTE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getProdukteEntry(id: string): Promise<Produkte | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.PRODUKTE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createProdukteEntry(fields: Produkte['fields']) {
    return callApi('POST', `/apps/${APP_IDS.PRODUKTE}/records`, { fields });
  }
  static async updateProdukteEntry(id: string, fields: Partial<Produkte['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.PRODUKTE}/records/${id}`, { fields });
  }
  static async deleteProdukteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.PRODUKTE}/records/${id}`);
  }

  // --- BESTELLUNGEN ---
  static async getBestellungen(): Promise<Bestellungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBestellungenEntry(id: string): Promise<Bestellungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBestellungenEntry(fields: Bestellungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BESTELLUNGEN}/records`, { fields });
  }
  static async updateBestellungenEntry(id: string, fields: Partial<Bestellungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`, { fields });
  }
  static async deleteBestellungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`);
  }

}