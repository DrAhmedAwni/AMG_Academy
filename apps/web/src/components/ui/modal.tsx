'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  maxWidth = 'md',
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      previousActiveElement.current?.focus();
    }
  }, [open]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'glass-strong w-full rounded-3xl animate-fade-in',
          'focus-visible:outline-none',
          maxWidthClasses[maxWidth],
        )}
      >
        <div className="flex items-start justify-between border-b border-surface-border/50 px-6 py-4">
          <div>
            <h2 id="modal-title" className="font-heading text-lg font-semibold text-text-primary">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
