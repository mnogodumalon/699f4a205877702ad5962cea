import type { Produkte, Kategorien, Verkaeufer } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconPencil, IconFileText } from '@tabler/icons-react';

interface ProdukteViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Produkte | null;
  onEdit: (record: Produkte) => void;
  kategorienList: Kategorien[];
  verkaeuferList: Verkaeufer[];
}

export function ProdukteViewDialog({ open, onClose, record, onEdit, kategorienList, verkaeuferList }: ProdukteViewDialogProps) {
  function getKategorienDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kategorienList.find(r => r.record_id === id)?.fields.kategorie_name ?? '—';
  }

  function getVerkaeuferDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return verkaeuferList.find(r => r.record_id === id)?.fields.firma_name ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Produkte anzeigen</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            Bearbeiten
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Produktname</Label>
            <p className="text-sm">{record.fields.produkt_name ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Produktbeschreibung</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.produkt_beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Preis (in Euro)</Label>
            <p className="text-sm">{record.fields.preis ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Kategorie</Label>
            <p className="text-sm">{getKategorienDisplayName(record.fields.kategorie)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Verkäufer</Label>
            <p className="text-sm">{getVerkaeuferDisplayName(record.fields.verkaeufer)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Verfügbar</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.verfuegbar ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.verfuegbar ? 'Ja' : 'Nein'}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Produktbilder</Label>
            {record.fields.produktbilder ? (
              <div className="relative w-full rounded-lg bg-muted overflow-hidden border">
                <img src={record.fields.produktbilder} alt="" className="w-full h-auto object-contain" />
              </div>
            ) : <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}