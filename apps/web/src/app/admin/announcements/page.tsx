'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Card, Input, StatusBadge } from '@/components/ui';
import { DataTable } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  targetRoles: string[];
  status: string;
  publishedAt: string | null;
};

type RoleItem = {
  id: string;
  slug: string;
  name: string;
};

function RichAnnouncementEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const applyCommand = (command: string) => {
    document.execCommand(command);
    onChange(ref.current?.innerHTML ?? '');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => applyCommand('bold')}>
          Bold
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => applyCommand('italic')}>
          Italic
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => applyCommand('insertUnorderedList')}>
          Bullets
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        className="min-h-[180px] rounded-md border border-surface-border bg-surface px-3 py-3 text-sm text-text-primary focus-within:border-brand-action"
      />
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('<p></p>');
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');

  const rolesQuery = useQuery({
    queryKey: ['announcement-role-options'],
    queryFn: async () => (await api.get('/roles', { params: { page: 1, limit: 100 } })).data.data,
  });
  const announcementsQuery = useQuery({
    queryKey: ['admin-announcements', search, status, page],
    queryFn: async () =>
      (await api.get('/announcements/admin', { params: { search, status, page, limit: 10 } })).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const plainBody = body.replace(/<[^>]*>/g, '').trim();
      let valid = true;
      if (title.trim().length < 3) { setTitleError('Title must be at least 3 characters'); valid = false; }
      else { setTitleError(''); }
      if (plainBody.length < 10) { setBodyError('Body must be at least 10 characters'); valid = false; }
      else { setBodyError(''); }
      if (!valid) throw new Error('validation');

      if (editing) {
        await api.patch(`/announcements/${editing.id}`, { title, body, targetRoles });
        return;
      }
      await api.post('/announcements', { title, body, targetRoles });
    },
    onSuccess: () => {
      toast.success('Announcement saved.');
      setEditing(null);
      setTitle('');
      setBody('<p></p>');
      setTargetRoles([]);
      setTitleError('');
      setBodyError('');
      void announcementsQuery.refetch();
    },
    onError: (error: any) => {
      if (error?.message !== 'validation') {
        toast.error(error?.response?.data?.error?.message ?? 'Failed to save announcement');
      }
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/announcements/${id}/publish`),
    onSuccess: () => {
      toast.success('Announcement published.');
      void announcementsQuery.refetch();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/announcements/${id}/archive`),
    onSuccess: () => {
      toast.success('Announcement archived.');
      void announcementsQuery.refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast.success('Announcement deleted.');
      void announcementsQuery.refetch();
    },
  });

  if (rolesQuery.isLoading || announcementsQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (rolesQuery.isError || announcementsQuery.isError) {
    return (
      <ErrorState
        title="Announcements are unavailable."
        description="Please retry once the announcements service is ready."
        onRetry={() => {
          void rolesQuery.refetch();
          void announcementsQuery.refetch();
        }}
      />
    );
  }

  const roles: RoleItem[] = rolesQuery.data?.items ?? [];
  const rows: AnnouncementRow[] = announcementsQuery.data?.items ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">Announcements</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Publish operational updates and audience-targeted academy communication.
          </p>
        </div>

        <FilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by title or body"
          filters={[
            {
              label: 'Status',
              value: status,
              onChange: (value) => {
                setStatus(value);
                setPage(1);
              },
              options: [
                { label: 'All statuses', value: '' },
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ],
            },
          ]}
        />

        <DataTable
          data={rows}
          rowKey={(row) => row.id}
          page={announcementsQuery.data?.meta?.page}
          totalPages={announcementsQuery.data?.meta?.totalPages}
          onPageChange={setPage}
          columns={[
            {
              id: 'title',
              header: 'Announcement',
              sortable: true,
              sortValue: (row) => row.title,
              cell: (row) => (
                <div>
                  <p className="font-medium text-text-primary">{row.title}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Targets: {row.targetRoles.length ? row.targetRoles.join(', ') : 'All users'}
                  </p>
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
              id: 'publishedAt',
              header: 'Published',
              sortable: true,
              sortValue: (row) => row.publishedAt ?? '',
              cell: (row) => <span>{row.publishedAt ? new Date(row.publishedAt).toLocaleString() : 'Draft'}</span>,
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditing(row);
                      setTitle(row.title);
                      setBody(row.body);
                      setTargetRoles(row.targetRoles);
                    }}
                  >
                    Edit
                  </Button>
                  {row.status !== 'published' ? (
                    <Button size="sm" onClick={() => void publishMutation.mutateAsync(row.id)}>
                      Publish
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => void archiveMutation.mutateAsync(row.id)}>
                      Archive
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => void deleteMutation.mutateAsync(row.id)}>
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
              {editing ? 'Edit announcement' : 'New announcement'}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Compose rich text and choose which audiences should receive it.
            </p>
          </div>
          {editing ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setTitle('');
                setBody('<p></p>');
                setTargetRoles([]);
                setTitleError('');
                setBodyError('');
              }}
            >
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
          <Input label="Title" value={title} error={titleError} onChange={(event) => { setTitle(event.target.value); setTitleError(''); }} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Target roles</p>
            <div className="grid gap-2 rounded-md border border-surface-border bg-surface-elevated p-3">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-3 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={targetRoles.includes(role.slug)}
                    onChange={(event) =>
                      setTargetRoles((current) =>
                        event.target.checked
                          ? [...current, role.slug]
                          : current.filter((item) => item !== role.slug),
                      )
                    }
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary">Body</p>
            <RichAnnouncementEditor value={body} onChange={(value) => { setBody(value); setBodyError(''); }} />
            {bodyError ? <span className="mt-1 text-xs text-status-error">{bodyError}</span> : null}
          </div>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : editing ? 'Update announcement' : 'Create announcement'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
