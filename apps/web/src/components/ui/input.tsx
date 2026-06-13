import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, required, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;
    const descriptionId = error ? `${inputId}-error` : undefined;

    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label ? (
          <span className="text-sm font-medium text-text-secondary">
            {label}
            {required ? <span className="ml-0.5 text-status-error">*</span> : null}
          </span>
        ) : null}
        <div className="relative">
          {icon ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={descriptionId}
            aria-required={required}
            className={cn(
              'h-[54px] w-full rounded-[18px] border bg-surface-card px-5 text-base text-text-primary shadow-sm',
              'placeholder:text-text-muted',
              'border-surface-border focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15',
              'transition-all duration-200',
              error &&
                'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/15',
              icon && 'pl-12',
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
