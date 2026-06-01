import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning' },
  successful: { label: 'Successful', className: 'bg-success/10 text-success' },
  failed: { label: 'Failed', className: 'bg-error/10 text-error' },
  refund_pending: { label: 'Refund Review', className: 'bg-warning/10 text-warning' },
  manually_verified: { label: 'Manual Verified', className: 'bg-brand-action/10 text-brand-action' },
  refunded: { label: 'Refunded', className: 'bg-text-muted/10 text-text-muted' },
  cancelled: { label: 'Cancelled', className: 'bg-text-muted/10 text-text-muted' },
  not_required: { label: 'Not Required', className: 'bg-text-muted/10 text-text-muted' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-text-muted/10 text-text-muted' };
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
