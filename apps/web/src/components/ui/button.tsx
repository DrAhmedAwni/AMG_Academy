import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-surface-main hover:bg-gold-light shadow-glow-sm hover:shadow-glow border-gold-dark/30 hover:border-gold-light/50 font-semibold',
  secondary:
    'bg-surface-elevated text-text-primary hover:bg-surface-strong border-surface-border hover:border-surface-strong',
  ghost:
    'bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary border-transparent hover:border-surface-border',
  danger:
    'bg-status-error/10 text-status-error hover:bg-status-error/20 border-status-error/20 hover:border-status-error/40',
  gold:
    'bg-gold/15 text-gold-light hover:bg-gold/25 border-gold/20 hover:border-gold/40 shadow-glow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-11 px-4 text-xs gap-1.5',
  md: 'h-12 px-6 text-sm gap-2',
  lg: 'h-[54px] px-8 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-main',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none',
        'border',
        icon ? 'p-2' : '',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
