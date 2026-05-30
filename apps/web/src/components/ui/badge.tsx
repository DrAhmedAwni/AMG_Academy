import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border-surface-border/60 bg-surface-elevated/80 text-text-secondary',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-cyan/30 bg-cyan/10 text-cyan',
  pending: 'border-pending/30 bg-pending/10 text-pending',
  paid: 'border-purple/40 bg-purple/10 text-purple-light',
  muted: 'border-surface-strong/50 bg-surface-elevated/40 text-text-muted',
  premium: 'border-cyan/40 bg-gradient-to-r from-cyan/15 to-transparent text-cyan-light shadow-glow-sm',
  glass: 'glass text-text-primary border-surface-border/40',
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
