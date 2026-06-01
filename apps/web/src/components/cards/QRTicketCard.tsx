'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card, StatusBadge } from '@/components/ui';
import { CalendarDays, QrCode } from 'lucide-react';

interface QRTicketCardProps {
  ticket: {
    id: string;
    event: { id: string; title: string; startDate: string };
    status: string;
    fallbackCode: string;
    issuedAt: string | null;
  };
}

export function QRTicketCard({ ticket }: QRTicketCardProps) {
  const qrValue = `${ticket.id}:${ticket.fallbackCode}`;

  return (
    <Card variant="glass" className="overflow-hidden">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="rounded-3xl border border-cyan/20 bg-white p-3 shadow-glow-sm">
          <QRCodeSVG value={qrValue} size={148} level="M" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan/10 text-cyan">
              <QrCode className="h-5 w-5" />
            </span>
            <StatusBadge status={ticket.status} />
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
