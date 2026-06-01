import * as React from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  accent,
  description,
  actions,
  className,
}: {
  title: string;
  accent?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold tracking-normal text-text-primary sm:text-3xl">
          {title}
          {accent ? <span className="text-gradient"> {accent}</span> : null}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
