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
        'inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200',
        active
          ? 'border-cyan/50 bg-cyan/10 text-cyan-light shadow-glow-sm'
          : 'border-surface-border/60 bg-surface-card/60 text-text-muted hover:border-surface-strong hover:text-text-secondary',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px]',
            active ? 'bg-cyan/20 text-cyan-light' : 'bg-surface-elevated text-text-muted',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
