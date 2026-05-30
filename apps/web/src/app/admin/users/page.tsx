'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, StatusBadge } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { DataTable } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { api } from '@/lib/api';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
};

type RoleOption = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});

  const rolesQuery = useQuery({
    queryKey: ['admin-roles-options'],
    queryFn: async () => (await api.get('/roles', { params: { page: 1, limit: 100 } })).data.data,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users', search, role, status, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search.trim()) {
        params.search = search.trim();
      }
      if (role) {
        params.role = role;
      }
      if (status) {
        params.status = status;
      }

      return (await api.get('/users', { params })).data.data;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) =>
      api.patch(`/users/${userId}/role`, { roleId }),
    onSuccess: () => {
      toast.success('User role updated.');
      void usersQuery.refetch();
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (userId: string) => api.delete(`/users/${userId}`),
    onSuccess: () => {
      toast.success('User disabled.');
      void usersQuery.refetch();
    },
  });

  const roles = useMemo<RoleOption[]>(() => rolesQuery.data?.items ?? [], [rolesQuery.data?.items]);
  const rows: UserRow[] = usersQuery.data?.items ?? [];

  if (rolesQuery.isLoading || usersQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (rolesQuery.isError || usersQuery.isError) {
    return (
      <ErrorState
        title="Users could not be loaded."
        description="Please retry once the admin API is reachable again."
        onRetry={() => {
          void rolesQuery.refetch();
          void usersQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Users</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Search, filter, reassign roles, and disable accounts without leaving the admin workspace.
        </p>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by user name or email"
        filters={[
          {
            label: 'Role',
            value: role,
            onChange: (value) => {
              setRole(value);
              setPage(1);
            },
            options: [{ label: 'All roles', value: '' }, ...roles.map((item) => ({ label: item.name, value: item.slug }))],
          },
          {
            label: 'Status',
            value: status,
            onChange: (value) => {
              setStatus(value);
              setPage(1);
            },
            options: [
              { label: 'All statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Disabled', value: 'disabled' },
              { label: 'Deleted', value: 'deleted' },
            ],
          },
        ]}
      />

      <DataTable
        data={rows}
        rowKey={(row) => row.id}
        page={usersQuery.data?.meta?.page}
        totalPages={usersQuery.data?.meta?.totalPages}
        onPageChange={setPage}
        bulkActions={[
          {
            label: 'Disable selected',
            variant: 'danger',
            onClick: async (selected) => {
              await Promise.all(selected.map((row) => disableMutation.mutateAsync(row.id)));
            },
          },
        ]}
        columns={[
          {
            id: 'name',
            header: 'User',
            sortable: true,
            sortValue: (row) => row.name,
            cell: (row) => (
              <div>
                <p className="font-medium text-text-primary">{row.name}</p>
                <p className="text-xs text-text-secondary">{row.email}</p>
              </div>
            ),
          },
          {
            id: 'role',
            header: 'Role',
            sortable: true,
            sortValue: (row) => row.role,
            cell: (row) => (
              <div className="space-y-2">
                <p className="text-text-primary">{row.role}</p>
                <div className="flex gap-2">
                  <select
                    value={roleDrafts[row.id] ?? roles.find((item) => item.slug === row.role)?.id ?? ''}
                    onChange={(event) =>
                      setRoleDrafts((current) => ({ ...current, [row.id]: event.target.value }))
                    }
                    className="h-9 rounded-md border border-surface-border bg-surface px-2 text-sm text-text-primary"
                  >
                    {roles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const roleId = roleDrafts[row.id] ?? roles.find((item) => item.slug === row.role)?.id;
                      if (!roleId) {
                        return;
                      }
                      void assignRoleMutation.mutateAsync({ userId: row.id, roleId });
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            sortable: true,
            sortValue: (row) => row.status,
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            id: 'verified',
            header: 'Verified',
            sortable: true,
            sortValue: (row) => (row.emailVerified ? 1 : 0),
            cell: (row) => <span className="text-text-primary">{row.emailVerified ? 'Yes' : 'No'}</span>,
          },
          {
            id: 'createdAt',
            header: 'Created',
            sortable: true,
            sortValue: (row) => row.createdAt,
            cell: (row) => <span>{new Date(row.createdAt).toLocaleDateString()}</span>,
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (row) => (
              <Button
                size="sm"
                variant="danger"
                onClick={() => void disableMutation.mutateAsync(row.id)}
              >
                Disable
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
