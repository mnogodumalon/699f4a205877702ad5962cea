import { useState, useEffect } from 'react';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Verkaeufer } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search, Building2, Mail, Phone, MapPin, User, FileText } from 'lucide-react';
import { VerkaeuferDialog } from '@/components/dialogs/VerkaeuferDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageShell } from '@/components/PageShell';
import { AI_PHOTO_SCAN } from '@/config/ai-features';

export default function VerkaeuferPage() {
  const [records, setRecords] = useState<Verkaeufer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Verkaeufer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Verkaeufer | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      setRecords(await LivingAppsService.getVerkaeufer());
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(fields: Verkaeufer['fields']) {
    await LivingAppsService.createVerkaeuferEntry(fields);
    await loadData();
    setDialogOpen(false);
  }

  async function handleUpdate(fields: Verkaeufer['fields']) {
    if (!editingRecord) return;
    await LivingAppsService.updateVerkaeuferEntry(editingRecord.record_id, fields);
    await loadData();
    setEditingRecord(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await LivingAppsService.deleteVerkaeuferEntry(deleteTarget.record_id);
    setRecords(prev => prev.filter(r => r.record_id !== deleteTarget.record_id));
    setDeleteTarget(null);
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
      title="Verkäufer"
      subtitle={`${records.length} Verkäufer im System`}
      action={
        <Button onClick={() => setDialogOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Hinzufügen
        </Button>
      }
    >
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Verkäufer suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Building2 size={40} className="opacity-20" />
          <p className="text-sm">{search ? 'Keine Ergebnisse gefunden.' : 'Noch keine Verkäufer. Jetzt hinzufügen!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(record => {
            const f = record.fields;
            const initials = [f.kontakt_vorname, f.kontakt_nachname]
              .filter(Boolean)
              .map(n => n![0].toUpperCase())
              .join('') || (f.firma_name?.[0]?.toUpperCase() ?? '?');
            const address = [f.strasse, f.hausnummer, f.postleitzahl, f.stadt].filter(Boolean).join(' ');

            return (
              <div
                key={record.record_id}
                className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                {/* Card header with avatar */}
                <div className="flex items-center gap-4 p-5 pb-4 border-b border-border/60">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-primary">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground truncate leading-tight">
                      {f.firma_name || 'Unbekannte Firma'}
                    </h3>
                    {(f.kontakt_vorname || f.kontakt_nachname) && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                        <User size={11} />
                        {[f.kontakt_vorname, f.kontakt_nachname].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                  {/* Actions — visible on hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setEditingRecord(record)}
                      title="Bearbeiten"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => setDeleteTarget(record)}
                      title="Löschen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Info rows */}
                <div className="p-5 pt-4 space-y-2.5">
                  {f.email && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail size={14} className="text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${f.email}`}
                        className="text-primary hover:underline truncate"
                        onClick={e => e.stopPropagation()}
                      >
                        {f.email}
                      </a>
                    </div>
                  )}
                  {f.telefon && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone size={14} className="text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${f.telefon}`}
                        className="text-foreground hover:text-primary truncate transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {f.telefon}
                      </a>
                    </div>
                  )}
                  {address && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-foreground/80 leading-snug">{address}</span>
                    </div>
                  )}
                  {f.beschreibung && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <FileText size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground line-clamp-2 leading-snug">{f.beschreibung}</span>
                    </div>
                  )}
                  {!f.email && !f.telefon && !address && !f.beschreibung && (
                    <p className="text-xs text-muted-foreground/50 italic">Keine weiteren Infos</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <VerkaeuferDialog
        open={dialogOpen || !!editingRecord}
        onClose={() => { setDialogOpen(false); setEditingRecord(null); }}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord?.fields}
        enablePhotoScan={AI_PHOTO_SCAN['Verkaeufer']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Verkäufer löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </PageShell>
  );
}
