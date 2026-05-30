import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;
    const descriptionId = error ? `${inputId}-error` : undefined;

    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-medium text-text-secondary">{label}</span>
        ) : null}
        <div className="relative">
          {icon ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={descriptionId}
            className={cn(
              'h-10 w-full rounded-xl border bg-surface-card/90 px-3 text-sm text-text-primary shadow-sm',
              'placeholder:text-text-muted/60',
              'border-surface-border/70 focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20',
              'transition-all duration-200',
              error &&
                'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20',
              icon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <span id={descriptionId} className="text-xs text-status-error">
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = 'Input';
