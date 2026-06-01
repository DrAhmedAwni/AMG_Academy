'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ui';
import { DataTable } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

type AuditRow = {
  id: string;
  actor: { name?: string; email?: string } | null;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string | null;
  createdAt: string;
};

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryKey: ['admin-audit-logs', search, action, page],
    queryFn: async () =>
      (await api.get('/audit-logs', { params: { entityType: search, action, page, limit: 10 } })).data.data,
  });

  if (auditQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (auditQuery.isError) {
    return (
      <ErrorState
        title="Audit logs are unavailable."
        description="Please retry after the logging service reconnects."
        onRetry={() => void auditQuery.refetch()}
      />
    );
  }

  const rows: AuditRow[] = auditQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Audit logs</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Review who changed what, when it happened, and which entity was affected.
        </p>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Filter by entity type"
        filters={[
          {
            label: 'Action',
            value: action,
            onChange: (value) => {
              setAction(value);
              setPage(1);
            },
            options: [
              { label: 'All actions', value: '' },
              { label: 'Create', value: 'create' },
              { label: 'Update', value: 'update' },
              { label: 'Delete', value: 'delete' },
              { label: 'Publish', value: 'publish' },
              { label: 'Archive', value: 'archive' },
              { label: 'Assign', value: 'assign' },
              { label: 'Verify', value: 'verify' },
              { label: 'Approve', value: 'approve' },
              { label: 'Reject', value: 'reject' },
            ],
          },
        ]}
      />

      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        page={auditQuery.data?.meta?.page}
        totalPages={auditQuery.data?.meta?.totalPages}
        onPageChange={setPage}
        columns={[
          {
            id: 'actor',
            header: 'Actor',
            sortable: true,
            sortValue: (row) => row.actor?.name ?? row.actor?.email ?? '',
            cell: (row) => (
              <div>
                <p className="font-medium text-text-primary">{row.actor?.name ?? 'Unknown actor'}</p>
                <p className="text-xs text-text-secondary">{row.actor?.email ?? row.ipAddress ?? '-'}</p>
              </div>
            ),
          },
          {
            id: 'action',
            header: 'Action',
            sortable: true,
            sortValue: (row) => row.action,
            cell: (row) => <StatusBadge status={row.action} />,
          },
          {
            id: 'entity',
            header: 'Entity',
            sortable: true,
            sortValue: (row) => `${row.entityType}-${row.entityId}`,
            cell: (row) => (
              <div>
                <p className="text-text-primary">{row.entityType}</p>
                <p className="text-xs text-text-secondary">{row.entityId}</p>
              </div>
            ),
          },
          {
            id: 'createdAt',
            header: 'Time',
            sortable: true,
            sortValue: (row) => row.createdAt,
            cell: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
          },
        ]}
      />
    </div>
  );
}
