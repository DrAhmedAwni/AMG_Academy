import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border-surface-border bg-surface-elevated text-text-secondary',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-info/30 bg-info/10 text-info',
  pending: 'border-pending/30 bg-pending/10 text-pending',
  paid: 'border-purple/40 bg-purple/10 text-purple-light',
  muted: 'border-surface-border bg-surface-elevated/50 text-text-muted',
  premium: 'border-gold/30 bg-gold/10 text-gold-light shadow-glow-sm',
  gold: 'border-gold/25 bg-gold/15 text-gold shadow-glow-sm',
} as const;

type BadgeVariant = keyof typeof badgeVariants;

type BadgeSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold leading-none',
        badgeVariants[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {props.children}
    </span>
  );
}
