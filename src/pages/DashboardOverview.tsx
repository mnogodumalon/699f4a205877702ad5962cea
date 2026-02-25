import { useState, useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichProdukte, enrichBestellungen } from '@/lib/enrich';
import type { EnrichedBestellungen } from '@/types/enriched';
import type { Bestellungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Plus, ShoppingCart, Package, Users, Tag, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BestellungenDialog } from '@/components/dialogs/BestellungenDialog';
import { AI_PHOTO_SCAN } from '@/config/ai-features';

type BestellStatus = 'neu' | 'in_bearbeitung' | 'versendet' | 'zugestellt' | 'storniert';

const STATUS_COLUMNS: { key: BestellStatus; label: string; color: string; bg: string; border: string; dot: string }[] = [
  { key: 'neu', label: 'Neu', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  { key: 'in_bearbeitung', label: 'In Bearbeitung', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  { key: 'versendet', label: 'Versendet', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
  { key: 'zugestellt', label: 'Zugestellt', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'storniert', label: 'Storniert', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
];

const NEXT_STATUS: Record<BestellStatus, BestellStatus | null> = {
  neu: 'in_bearbeitung',
  in_bearbeitung: 'versendet',
  versendet: 'zugestellt',
  zugestellt: null,
  storniert: null,
};

export default function DashboardOverview() {
  const {
    kategorien, verkaeufer, produkte, bestellungen,
    kategorienMap, verkaeuferMap, produkteMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<EnrichedBestellungen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const enrichedProdukte = useMemo(
    () => enrichProdukte(produkte, { kategorienMap, verkaeuferMap }),
    [produkte, kategorienMap, verkaeuferMap]
  );
  const enrichedBestellungen = useMemo(
    () => enrichBestellungen(bestellungen, { produkteMap }),
    [bestellungen, produkteMap]
  );

  const statusGroups = useMemo(() => {
    const groups: Record<BestellStatus, EnrichedBestellungen[]> = {
      neu: [], in_bearbeitung: [], versendet: [], zugestellt: [], storniert: [],
    };
    for (const b of enrichedBestellungen) {
      const s = (b.fields.bestellstatus ?? 'neu') as BestellStatus;
      if (groups[s]) groups[s].push(b);
      else groups['neu'].push(b);
    }
    // Sort each column by date desc
    for (const key of Object.keys(groups) as BestellStatus[]) {
      groups[key].sort((a, b) =>
        (b.fields.bestelldatum ?? '').localeCompare(a.fields.bestelldatum ?? '')
      );
    }
    return groups;
  }, [enrichedBestellungen]);

  const totalRevenue = useMemo(
    () => bestellungen.reduce((sum, b) => sum + (b.fields.gesamtbetrag ?? 0), 0),
    [bestellungen]
  );
  const activeOrders = useMemo(
    () => bestellungen.filter(b => b.fields.bestellstatus !== 'storniert' && b.fields.bestellstatus !== 'zugestellt').length,
    [bestellungen]
  );

  const handleCreate = useCallback(async (fields: Bestellungen['fields']) => {
    await LivingAppsService.createBestellungenEntry(fields);
    fetchAll();
  }, [fetchAll]);

  const handleEdit = useCallback(async (fields: Bestellungen['fields']) => {
    if (!editRecord) return;
    await LivingAppsService.updateBestellungenEntry(editRecord.record_id, fields);
    fetchAll();
  }, [editRecord, fetchAll]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await LivingAppsService.deleteBestellungenEntry(deleteTarget);
    setDeleteTarget(null);
    fetchAll();
  }, [deleteTarget, fetchAll]);

  const handleAdvanceStatus = useCallback(async (order: EnrichedBestellungen) => {
    const current = (order.fields.bestellstatus ?? 'neu') as BestellStatus;
    const next = NEXT_STATUS[current];
    if (!next) return;
    setMovingId(order.record_id);
    try {
      await LivingAppsService.updateBestellungenEntry(order.record_id, { bestellstatus: next });
      fetchAll();
    } finally {
      setMovingId(null);
    }
  }, [fetchAll]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bestellübersicht</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verwalten Sie den gesamten Bestellprozess</p>
        </div>
        <Button
          onClick={() => { setEditRecord(null); setDialogOpen(true); }}
          className="gap-2"
        >
          <Plus size={16} />
          Neue Bestellung
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Bestellungen gesamt"
          value={String(bestellungen.length)}
          description="Alle Bestellungen"
          icon={<ShoppingCart size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Aktive Bestellungen"
          value={String(activeOrders)}
          description="Offen & in Arbeit"
          icon={<Package size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Umsatz gesamt"
          value={formatCurrency(totalRevenue)}
          description="Alle Bestellungen"
          icon={<Tag size={18} className="text-muted-foreground" />}
        />
        <StatCard
          title="Produkte"
          value={String(produkte.length)}
          description={`${kategorien.length} Kategorien`}
          icon={<Users size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {STATUS_COLUMNS.map(col => {
            const orders = statusGroups[col.key];
            return (
              <div key={col.key} className="w-72 lg:w-auto flex flex-col gap-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${col.bg} ${col.border} border`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold h-5 px-1.5">
                    {orders.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 min-h-[120px]">
                  {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border/50 text-muted-foreground/50 text-xs">
                      Leer
                    </div>
                  ) : (
                    orders.map(order => (
                      <OrderCard
                        key={order.record_id}
                        order={order}
                        colConfig={col}
                        isMoving={movingId === order.record_id}
                        canAdvance={NEXT_STATUS[col.key] !== null}
                        onEdit={() => { setEditRecord(order); setDialogOpen(true); }}
                        onDelete={() => setDeleteTarget(order.record_id)}
                        onAdvance={() => handleAdvanceStatus(order)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialogs */}
      <BestellungenDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditRecord(null); }}
        onSubmit={editRecord ? handleEdit : handleCreate}
        defaultValues={editRecord?.fields}
        produkteList={produkte}
        enablePhotoScan={AI_PHOTO_SCAN['Bestellungen']}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Bestellung löschen"
        description="Diese Bestellung wird unwiderruflich gelöscht. Fortfahren?"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

interface OrderCardProps {
  order: EnrichedBestellungen;
  colConfig: typeof STATUS_COLUMNS[number];
  isMoving: boolean;
  canAdvance: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAdvance: () => void;
}

function OrderCard({ order, colConfig, isMoving, canAdvance, onEdit, onDelete, onAdvance }: OrderCardProps) {
  const name = [order.fields.kaeufer_vorname, order.fields.kaeufer_nachname].filter(Boolean).join(' ') || 'Unbekannt';
  const city = order.fields.liefer_stadt || order.fields.liefer_postleitzahl || null;

  return (
    <div
      className={`group bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isMoving ? 'opacity-60 scale-95' : 'hover:-translate-y-0.5'
      }`}
      onClick={onEdit}
    >
      {/* Product name */}
      <p className="text-sm font-semibold text-foreground leading-snug truncate">
        {order.produkteName || '—'}
      </p>

      {/* Buyer */}
      <p className="text-xs text-muted-foreground mt-1 truncate">{name}</p>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
        <div className="flex flex-col gap-0.5">
          {order.fields.gesamtbetrag != null && (
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(order.fields.gesamtbetrag)}
            </span>
          )}
          {order.fields.bestelldatum && (
            <span className="text-[11px] text-muted-foreground">{formatDate(order.fields.bestelldatum)}</span>
          )}
          {city && <span className="text-[11px] text-muted-foreground">{city}</span>}
        </div>

        {/* Action buttons — visible on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          {canAdvance && (
            <button
              className={`p-1.5 rounded-lg ${colConfig.bg} ${colConfig.color} hover:opacity-80 transition-opacity`}
              title="Nächsten Status setzen"
              onClick={onAdvance}
              disabled={isMoving}
            >
              <ChevronRight size={13} />
            </button>
          )}
          <button
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Bearbeiten"
            onClick={onEdit}
          >
            <Pencil size={13} />
          </button>
          <button
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-destructive transition-colors"
            title="Löschen"
            onClick={onDelete}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <AlertCircle size={22} className="text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground mb-1">Fehler beim Laden</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{error.message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
