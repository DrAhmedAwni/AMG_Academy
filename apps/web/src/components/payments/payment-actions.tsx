import { Button } from '@/components/ui';
import { CheckCircle2, XCircle, Ban } from 'lucide-react';

interface PaymentActionsProps {
  status: string;
  onSuccess: () => void;
  onFail: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PaymentActions({ status, onSuccess, onFail, onCancel, loading }: PaymentActionsProps) {
  if (status !== 'pending') return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">This is a mock payment. Choose an action:</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="gold" size="lg" onClick={onSuccess} loading={loading}>
          <CheckCircle2 className="h-5 w-5" />
          Pay Now (Mock Success)
        </Button>
        <Button variant="danger" size="lg" onClick={onFail} loading={loading}>
          <XCircle className="h-5 w-5" />
          Fail Payment
        </Button>
        <Button variant="secondary" size="lg" onClick={onCancel} loading={loading}>
          <Ban className="h-5 w-5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
