import { Card } from '@/components/ui';
import { PaymentStatusBadge } from './payment-status-badge';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';

interface PaymentSummaryProps {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  itemType: 'EVENT' | 'COURSE';
  itemTitle: string;
}

export function PaymentSummary({ amount, currency, status, provider, createdAt, itemType, itemTitle }: PaymentSummaryProps) {
  return (
    <Card variant="elevated" className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Payment Summary</h3>
        <PaymentStatusBadge status={status} />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">{itemType === 'COURSE' ? 'Course' : 'Event'}</span>
          <span className="font-medium text-text-primary">{itemTitle}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-muted">
            <DollarSign className="h-4 w-4" />
            Amount
          </span>
          <span className="font-semibold text-text-primary">
            {amount} {currency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-muted">
            <CreditCard className="h-4 w-4" />
            Provider
          </span>
          <span className="font-medium text-text-primary capitalize">{provider}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-text-muted">
            <Calendar className="h-4 w-4" />
            Created
          </span>
          <span className="font-medium text-text-primary">
            {new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
