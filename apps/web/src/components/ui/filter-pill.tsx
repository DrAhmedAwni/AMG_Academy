import * as React from 'react';
import { cn } from '@/lib/utils';

export function FilterPill({
  active,
  count,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  count?: number;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200',
        active
          ? 'border-gold/40 bg-gold/10 text-gold-light shadow-glow-sm'
          : 'border-surface-border bg-surface-card text-text-muted hover:border-surface-strong hover:text-text-secondary',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px]',
            active ? 'bg-gold/20 text-gold-light' : 'bg-surface-elevated text-text-muted',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
