'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  actions,
  className,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass flex flex-col gap-4 rounded-3xl p-4 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          icon={<Search className="h-4 w-4" />}
          className="md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <label key={filter.label} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">{filter.label}:</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="h-9 rounded-xl border border-surface-border/70 bg-surface-card/90 px-3 text-sm text-text-primary focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
