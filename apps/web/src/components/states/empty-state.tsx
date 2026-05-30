import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass flex flex-col items-center justify-center rounded-3xl border-dashed p-12 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border/50 bg-surface-elevated/60 text-cyan/70">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}
