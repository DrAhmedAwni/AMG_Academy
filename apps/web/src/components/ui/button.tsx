import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan text-surface-main hover:bg-cyan-light shadow-glow-sm hover:shadow-glow border-cyan/40 hover:border-cyan-light/70',
  secondary:
    'bg-surface-elevated/80 text-text-primary hover:bg-surface-strong border-surface-border hover:border-surface-strong',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface/70 hover:text-text-primary border-transparent hover:border-surface-border/60',
  danger:
    'bg-status-error/10 text-status-error hover:bg-status-error/20 border-status-error/20 hover:border-status-error/40',
  glow: 'bg-cyan text-surface-main shadow-glow hover:bg-cyan-light hover:shadow-glow-lg border-cyan/50 hover:border-cyan-light/80',
  glass:
    'glass text-text-primary hover:bg-surface-elevated/90 border-surface-strong/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-main',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
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
