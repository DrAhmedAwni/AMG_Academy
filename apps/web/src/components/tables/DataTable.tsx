'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Column<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  className?: string;
  sortValue?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
};

type BulkAction<T> = {
  label: string;
  onClick: (rows: T[]) => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
  rowActions,
  bulkActions = [],
  page,
  totalPages,
  onPageChange,
  emptyMessage = 'No records found.',
  className,
}: {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  rowActions?: (row: T) => React.ReactNode;
  bulkActions?: BulkAction<T>[];
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  className?: string;
}) {
  const [sort, setSort] = useState<{ id: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return data;
    return [...data].sort((left, right) => {
      const leftValue = column.sortValue?.(left) ?? '';
      const rightValue = column.sortValue?.(right) ?? '';
      if (leftValue === rightValue) return 0;
      const result = leftValue > rightValue ? 1 : -1;
      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, data, sort]);

  const selectedRows = sortedData.filter((row) => selectedKeys.includes(rowKey(row)));
  const allSelected = sortedData.length > 0 && selectedRows.length === sortedData.length;

  return (
    <div className={cn('space-y-4', className)}>
      {bulkActions.length > 0 || selectedRows.length > 0 ? (
        <div className="glass flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3">
          <span className="text-sm text-text-secondary">
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? 'secondary'}
              disabled={selectedRows.length === 0}
              onClick={() => action.onClick(selectedRows)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-surface-border/60 bg-surface-card/70 shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border/50 bg-surface-elevated/70">
              <th className="w-10 px-4 py-3.5">
                <input
                  aria-label="Select all rows"
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedKeys(sortedData.map((row) => rowKey(row)));
                      return;
                    }
                    setSelectedKeys([]);
                  }}
                  className="rounded border-surface-border bg-surface"
                />
              </th>
              {columns.map((column) => (
                <th key={column.id} className={cn('px-4 py-3.5', column.className)}>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted',
                      column.sortable ? 'hover:text-text-primary' : 'cursor-default',
                    )}
                    onClick={() => {
                      if (!column.sortable) return;
                      setSort((current) => {
                        if (!current || current.id !== column.id) {
                          return { id: column.id, direction: 'asc' };
                        }
                        return {
                          id: column.id,
                          direction: current.direction === 'asc' ? 'desc' : 'asc',
                        };
                      });
                    }}
                  >
                    {column.header}
                    {sort?.id === column.id ? (
                      sort.direction === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
              {rowActions ? <th className="w-32 px-4 py-3.5 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/25">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => {
                const key = rowKey(row);
                return (
                  <tr
                    key={key}
                    className={cn(
                      'transition-colors hover:bg-cyan/[0.035]',
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-main/25',
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        aria-label={`Select row ${key}`}
                        type="checkbox"
                        checked={selectedKeys.includes(key)}
                        onChange={(event) => {
                          setSelectedKeys((current) =>
                            event.target.checked
                              ? [...current, key]
                              : current.filter((item) => item !== key),
                          );
                        }}
                        className="rounded border-surface-border bg-surface"
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.id} className={cn('px-4 py-3.5 align-middle', column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center justify-end gap-1">{rowActions(row)}</div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {page && totalPages && totalPages > 1 ? (
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <p className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
