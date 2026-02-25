import { useState, useEffect } from 'react';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import type { Produkte, Kategorien, Verkaeufer } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Plus, Search, FileText } from 'lucide-react';
import { ProdukteDialog } from '@/components/dialogs/ProdukteDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN } from '@/config/ai-features';

export default function ProduktePage() {
  const [records, setRecords] = useState<Produkte[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Produkte | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Produkte | null>(null);
  const [kategorienList, setKategorienList] = useState<Kategorien[]>([]);
  const [verkaeuferList, setVerkaeuferList] = useState<Verkaeufer[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, kategorienData, verkaeuferData] = await Promise.all([
        LivingAppsService.getProdukte(),
        LivingAppsService.getKategorien(),
        LivingAppsService.getVerkaeufer(),
      ]);
      setRecords(mainData);
      setKategorienList(kategorienData);
      setVerkaeuferList(verkaeuferData);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields: Produkte['fields']) {
    await LivingAppsService.createProdukteEntry(fields);
    await loadData();
    setDialogOpen(false);
  }

  async function handleUpdate(fields: Produkte['fields']) {
    if (!editingRecord) return;
    await LivingAppsService.updateProdukteEntry(editingRecord.record_id, fields);
    await loadData();
    setEditingRecord(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await LivingAppsService.deleteProdukteEntry(deleteTarget.record_id);
    setRecords(prev => prev.filter(r => r.record_id !== deleteTarget.record_id));
    setDeleteTarget(null);
  }

  function getKategorienDisplayName(url?: string) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kategorienList.find(r => r.record_id === id)?.fields.kategorie_name ?? '—';
  }

  function getVerkaeuferDisplayName(url?: string) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return verkaeuferList.find(r => r.record_id === id)?.fields.firma_name ?? '—';
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(r.fields).some(v => {
      if (v == null) return false;
      if (Array.isArray(v)) return v.some(item => typeof item === 'object' && item !== null && 'label' in item ? String((item as any).label).toLowerCase().includes(s) : String(item).toLowerCase().includes(s));
      if (typeof v === 'object' && 'label' in (v as any)) return String((v as any).label).toLowerCase().includes(s);
      return String(v).toLowerCase().includes(s);
    });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageShell
      title="Produkte"
      subtitle={`${records.length} Produkte im System`}
      action={
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Produkte suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produktname</TableHead>
              <TableHead>Produktbeschreibung</TableHead>
              <TableHead>Preis (in Euro)</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Verkäufer</TableHead>
              <TableHead>Verfügbar</TableHead>
              <TableHead>Produktbilder</TableHead>
              <TableHead className="w-24">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(record => (
              <TableRow key={record.record_id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{record.fields.produkt_name ?? '—'}</TableCell>
                <TableCell className="max-w-xs"><span className="truncate block">{record.fields.produkt_beschreibung ?? '—'}</span></TableCell>
                <TableCell>{record.fields.preis ?? '—'}</TableCell>
                <TableCell>{getKategorienDisplayName(record.fields.kategorie)}</TableCell>
                <TableCell>{getVerkaeuferDisplayName(record.fields.verkaeufer)}</TableCell>
                <TableCell><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${record.fields.verfuegbar ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{record.fields.verfuegbar ? 'Ja' : 'Nein'}</span></TableCell>
                <TableCell>{record.fields.produktbilder ? <div className="relative h-8 w-8 rounded bg-muted overflow-hidden"><div className="absolute inset-0 flex items-center justify-center"><FileText size={14} className="text-muted-foreground" /></div><img src={record.fields.produktbilder} alt="" className="relative h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /></div> : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(record)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  {search ? 'Keine Ergebnisse gefunden.' : 'Noch keine Produkte. Jetzt hinzufügen!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProdukteDialog
        open={dialogOpen || !!editingRecord}
        onClose={() => { setDialogOpen(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord?.fields}
        kategorienList={kategorienList}
        verkaeuferList={verkaeuferList}
        enablePhotoScan={AI_PHOTO_SCAN['Produkte']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Produkte löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </PageShell>
  );
}