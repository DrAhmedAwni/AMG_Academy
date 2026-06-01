import * as React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glass' | 'elevated' | 'stat' | 'action';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'rounded-2xl border border-surface-border/70 bg-surface-card/90 shadow-card premium-ring',
  glass:
    'rounded-2xl glass',
  elevated:
    'rounded-2xl border border-surface-border/70 bg-surface-elevated/88 shadow-elevated premium-ring',
  stat:
    'rounded-2xl border border-surface-border/70 bg-surface-card/88 shadow-card overflow-hidden relative premium-ring',
  action:
    'rounded-2xl border border-surface-border/70 bg-surface-card/88 shadow-card cursor-pointer transition-all duration-200 hover:border-cyan/40 hover:shadow-glow-sm premium-ring',
};

export function Card({
  className,
  variant = 'default',
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'p-5',
        variantStyles[variant],
        hover && !['action'].includes(variant) && 'cursor-pointer transition-all duration-200 hover:border-cyan/30 hover:shadow-elevated',
        className,
      )}
      {...props}
    />
  );
}
