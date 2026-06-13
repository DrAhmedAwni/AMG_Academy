import * as React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'stat' | 'action';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'rounded-2xl border border-surface-border bg-surface-card shadow-card gold-ring',
  elevated:
    'rounded-2xl border border-surface-border bg-surface-elevated shadow-elevated gold-ring',
  stat:
    'rounded-2xl border border-surface-border bg-surface-card shadow-card overflow-hidden relative gold-ring',
  action:
    'rounded-2xl border border-surface-border bg-surface-card shadow-card cursor-pointer transition-all duration-200 hover:border-gold/25 hover:shadow-glow-sm gold-ring',
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
        hover && !['action'].includes(variant) && 'cursor-pointer transition-all duration-200 hover:border-gold/20 hover:shadow-glow-sm',
        className,
      )}
      {...props}
    />
  );
}
