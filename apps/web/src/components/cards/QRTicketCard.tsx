'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button, Card, StatusBadge } from '@/components/ui';
import { CalendarDays, Lock, QrCode, Trash2 } from 'lucide-react';

interface QRTicketCardProps {
  ticket: {
    id: string;
    event: { id: string; title: string; startDate: string };
    status: string;
    qrPayload?: string | null;
    fallbackCode: string;
    issuedAt: string | null;
  };
  canDelete?: boolean;
  deleteLoading?: boolean;
  onDelete?: () => void;
}

export function QRTicketCard({
  ticket,
  canDelete = false,
  deleteLoading = false,
  onDelete,
}: QRTicketCardProps) {
  const canDisplayQr = Boolean(ticket.qrPayload);
  const qrValue = ticket.qrPayload ?? `${ticket.id}:${ticket.fallbackCode}`;

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-[174px] w-[174px] shrink-0 items-center justify-center rounded-3xl border border-cyan/20 bg-white p-3 shadow-glow-sm">
          {canDisplayQr ? (
            <QRCodeSVG value={qrValue} size={148} level="M" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-surface-main text-center">
              <Lock className="h-7 w-7 text-text-muted" />
              <span className="px-3 text-xs font-semibold text-text-muted">QR unavailable</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan/10 text-cyan">
                <QrCode className="h-5 w-5" />
              </span>
              <StatusBadge status={ticket.status} />
            </div>
            {canDelete ? (
              <Button
                type="button"
                size="sm"
                variant="danger"
                loading={deleteLoading}
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
          <h3 className="mt-3 font-heading text-xl font-semibold text-text-primary">
            {ticket.event.title}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary">
            <CalendarDays className="h-4 w-4 text-cyan" />
            {new Date(ticket.event.startDate).toLocaleDateString()}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            Present this QR ticket at event check-in. If scanning fails, staff can
            use the fallback code below.
          </p>
          <p className="mt-3 rounded-2xl border border-surface-border/50 bg-surface-main/50 px-3 py-2 text-xs text-text-muted">
            Fallback code: <span className="font-mono text-text-primary">{ticket.fallbackCode}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
