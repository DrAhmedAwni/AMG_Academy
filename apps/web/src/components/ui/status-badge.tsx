import { Badge } from './badge';

const statusMap: Record<
  string,
  'success' | 'warning' | 'error' | 'info' | 'default' | 'pending' | 'paid' | 'muted'
> = {
  active: 'success',
  confirmed: 'success',
  approved: 'success',
  attended: 'success',
  completed: 'success',
  enrolled: 'success',
  published: 'info',
  upcoming: 'info',
  free: 'success',
  valid: 'success',
  draft: 'muted',
  pending: 'pending',
  pending_approval: 'pending',
  pending_payment: 'pending',
  cancelled: 'error',
  rejected: 'error',
  disabled: 'error',
  revoked: 'error',
  expired: 'error',
  finished: 'muted',
  archived: 'muted',
  paid: 'paid',
  unpaid: 'warning',
};

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase().replace(/\s+/g, '_') ?? '';
  const variant = statusMap[key] ?? 'default';

  const label = status
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return <Badge variant={variant} dot>{label}</Badge>;
}
