'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { DataTable } from '@/components/tables/DataTable';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type RoleRow = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  usersCount: number;
  permissions: { id: string; module: string; action: string }[];
};

type PermissionItem = {
  id: string;
  module: string;
  action: string;
  description?: string;
};

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  permissionIds: [] as string[],
};

export default function AdminRolesPage() {
  const [form, setForm] = useState(emptyForm);

  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => (await api.get('/roles', { params: { page: 1, limit: 100 } })).data.data,
  });
  const permissionsQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => (await api.get('/permissions')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (form.id) {
        await api.patch(`/roles/${form.id}`, {
          name: form.name,
          slug: form.slug,
          description: form.description,
        });
        await api.put(`/roles/${form.id}/permissions`, {
          permissionIds: form.permissionIds,
        });
        return;
      }

      const response = await api.post('/roles', {
        name: form.name,
        slug: form.slug,
        description: form.description,
      });
      const roleId = response.data.data.id as string;
      await api.put(`/roles/${roleId}/permissions`, {
        permissionIds: form.permissionIds,
      });
    },
    onSuccess: () => {
      toast.success('Role saved.');
      setForm(emptyForm);
      void rolesQuery.refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => api.delete(`/roles/${roleId}`),
    onSuccess: () => {
      toast.success('Role deleted.');
      setForm(emptyForm);
      void rolesQuery.refetch();
    },
  });

  const rows: RoleRow[] = rolesQuery.data?.items ?? [];
  const permissions: PermissionItem[] = permissionsQuery.data?.data ?? permissionsQuery.data ?? [];

  useEffect(() => {
    if (!form.id) {
      return;
    }
    const current = rows.find((item) => item.id === form.id);
    if (!current) {
      setForm(emptyForm);
    }
  }, [form.id, rows]);

  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (rolesQuery.isError || permissionsQuery.isError) {
    return (
      <ErrorState
        title="Roles are unavailable."
        description="Please retry after the admin API reconnects."
        onRetry={() => {
          void rolesQuery.refetch();
          void permissionsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">Roles & permissions</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Shape admin access by editing roles and permission assignments in one place.
          </p>
        </div>

        <DataTable
          data={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              id: 'name',
              header: 'Role',
              sortable: true,
              sortValue: (row) => row.name,
              cell: (row) => (
                <div>
                  <p className="font-medium text-text-primary">{row.name}</p>
                  <p className="text-xs text-text-secondary">{row.slug}</p>
                </div>
              ),
            },
            {
              id: 'usersCount',
              header: 'Users',
              sortable: true,
              sortValue: (row) => row.usersCount,
              cell: (row) => <span>{row.usersCount}</span>,
            },
            {
              id: 'permissions',
              header: 'Permissions',
              sortable: true,
              sortValue: (row) => row.permissions.length,
              cell: (row) => <span>{row.permissions.length}</span>,
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setForm({
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        description: row.description ?? '',
                        permissionIds: row.permissions.map((item) => item.id),
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => void deleteMutation.mutateAsync(row.id)}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Card className="h-fit">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-text-primary">
              {form.id ? 'Edit role' : 'Create role'}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Assign permission coverage before saving the role.
            </p>
          </div>
          {form.id ? (
            <Button variant="ghost" onClick={() => setForm(emptyForm)}>
              Reset
            </Button>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void saveMutation.mutateAsync();
          }}
        >
          <Input label="Role name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input label="Slug" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[96px] rounded-md border border-surface-border bg-surface px-3 py-3 text-sm text-text-primary focus:border-brand-action focus:outline-none focus:ring-2 focus:ring-brand-action/30"
            />
          </label>
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">Permissions</p>
            <div className="grid max-h-[320px] gap-2 overflow-y-auto rounded-md border border-surface-border bg-surface-elevated p-3">
              {permissions.map((permission) => {
                const key = `${permission.module}:${permission.action}`;
                return (
                  <label key={permission.id} className="flex items-center gap-3 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={form.permissionIds.includes(permission.id)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          permissionIds: event.target.checked
                            ? [...current.permissionIds, permission.id]
                            : current.permissionIds.filter((item) => item !== permission.id),
                        }))
                      }
                    />
                    <span>{key}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : form.id ? 'Update role' : 'Create role'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
