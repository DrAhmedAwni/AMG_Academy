'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/tables/DataTable';
import { Button, Input, Modal } from '@/components/ui';
import { LoadingSkeleton, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react';
import Link from 'next/link';

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

async function fetchPages() {
  const { data } = await api.get('/content-pages/admin');
  return data;
}

async function createPage(body: Record<string, unknown>) {
  const { data } = await api.post('/content-pages', body);
  return data;
}

async function updatePage(id: string, body: Record<string, unknown>) {
  const { data } = await api.patch(`/content-pages/${id}`, body);
  return data;
}

async function deletePage(id: string) {
  const { data } = await api.delete(`/content-pages/${id}`);
  return data;
}

async function publishPage(id: string) {
  const { data } = await api.post(`/content-pages/${id}/publish`);
  return data;
}

export default function AdminContentPagesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-content-pages'],
    queryFn: fetchPages,
  });

  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      toast.success('Page created');
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-content-pages'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => updatePage(id, body),
    onSuccess: () => {
      toast.success('Page updated');
      setEditingPage(null);
      queryClient.invalidateQueries({ queryKey: ['admin-content-pages'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      toast.success('Page deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-content-pages'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to delete'),
  });

  const publishMutation = useMutation({
    mutationFn: publishPage,
    onSuccess: () => {
      toast.success('Page published');
      queryClient.invalidateQueries({ queryKey: ['admin-content-pages'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to publish'),
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load pages" description={error?.message ?? ''} onRetry={refetch} />;

  const pages: ContentPage[] = data?.data?.data ?? data?.data ?? [];

  const columns = [
    { id: 'title', header: 'Title', cell: (p: ContentPage) => p.title },
    { id: 'slug', header: 'Slug', cell: (p: ContentPage) => p.slug },
    { id: 'status', header: 'Status', cell: (p: ContentPage) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        p.status === 'PUBLISHED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
      }`}>
        {p.status}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Content Pages</h1>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Page
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={pages}
        rowKey={(p) => p.id}
        rowActions={(page: ContentPage) => (
          <div className="flex items-center gap-2">
            <Link href={`/content/${page.slug}`} target="_blank">
              <Button variant="ghost" size="sm"><Globe className="h-4 w-4" /></Button>
            </Link>
            {page.status !== 'PUBLISHED' && (
              <Button variant="ghost" size="sm" onClick={() => publishMutation.mutate(page.id)}>
                <FileText className="h-4 w-4 text-success" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditingPage(page)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(page.id)}>
              <Trash2 className="h-4 w-4 text-error" />
            </Button>
          </div>
        )}
      />

      {showCreateModal && (
        <ContentPageModal
          title="Create Content Page"
          onClose={() => setShowCreateModal(false)}
          onSubmit={(body) => createMutation.mutate(body)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingPage && (
        <ContentPageModal
          title="Edit Content Page"
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSubmit={(body) => updateMutation.mutate({ id: editingPage.id, body })}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ContentPageModal({
  title,
  page,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  page?: ContentPage;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    body: page?.body ?? '',
  });

  return (
    <Modal open title={title} onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-secondary">Content</label>
          <textarea
            className="w-full rounded-lg border border-border bg-background-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-action"
            rows={10}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
