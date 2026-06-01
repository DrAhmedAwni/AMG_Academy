import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-status-error/25 bg-status-error/5 p-12 text-center shadow-card',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-status-error/10 text-status-error">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {onRetry ? (
        <Button className="mt-5" variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
