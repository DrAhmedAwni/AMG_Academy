'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, CalendarDays, Tag } from 'lucide-react';

interface CategoryEvent {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  status: string;
  price: string | number;
  capacity: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { events: number };
  events: CategoryEvent[];
}

function EditCategoryModal({
  category,
  open,
  onClose,
  onSave,
}: {
  category: CategoryItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; slug: string; description: string }) => void;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [description, setDescription] = useState(category?.description ?? '');

  return (
    <Modal open={open} title="Edit Category" onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ name, slug, description })}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminEventCategoriesPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      const res = await api.get('/event-categories');
      const payload = res.data?.data ?? res.data;
      return (Array.isArray(payload) ? payload : []) as CategoryItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/event-categories', { name, slug, description });
    },
    onSuccess: () => {
      toast.success('Category created');
      setName('');
      setSlug('');
      setDescription('');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: body }: { id: string; data: { name: string; slug: string; description: string } }) => {
      await api.patch(`/event-categories/${id}`, body);
    },
    onSuccess: () => {
      toast.success('Category updated');
      setEditingCategory(null);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/event-categories/${id}`);
    },
    onSuccess: () => {
      toast.success('Category deleted');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to delete category');
    },
  });

  if (isLoading) return <LoadingSkeleton lines={4} />;
  if (isError) return <ErrorState title="Failed to load categories" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const categories: CategoryItem[] = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Event Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage categories and view events in each.</p>
        </div>
      </div>

      <Card>
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          <Plus className="mr-2 inline-block h-4 w-4" />
          Create Category
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button className="self-end" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name.trim() || !slug.trim()}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create a category to get started." />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const isExpanded = expandedId === cat.id;
            return (
              <Card key={cat.id} className="p-0">
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    type="button"
                    className="flex flex-1 items-center gap-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{cat.name}</span>
                        <Badge size="sm" variant="info">{cat._count.events} event{cat._count.events !== 1 ? 's' : ''}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-text-muted">/{cat.slug}{cat.description ? ` — ${cat.description}` : ''}</p>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" icon onClick={() => setEditingCategory(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" icon onClick={() => { if (confirm('Delete this category?')) deleteMutation.mutate(cat.id); }}>
                      <Trash2 className="h-4 w-4 text-status-error/70 hover:text-status-error" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-surface-border/50 px-5 py-3">
                    {cat.events.length === 0 ? (
                      <p className="py-2 text-sm text-text-muted">No events in this category yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {cat.events.map((event) => (
                          <a
                            key={event.id}
                            href={`/admin/events/${event.id}`}
                            className="flex items-center gap-3 rounded-xl bg-surface-elevated/50 px-3 py-2 text-sm transition-colors hover:bg-surface-elevated"
                          >
                            <CalendarDays className="h-4 w-4 shrink-0 text-text-muted" />
                            <span className="flex-1 font-medium text-text-primary">{event.title}</span>
                            <Badge size="sm" variant={event.status === 'published' ? 'success' : event.status === 'cancelled' ? 'error' : 'default'}>
                              {event.status}
                            </Badge>
                            <span className="text-xs text-text-muted">
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <EditCategoryModal
        category={editingCategory}
        open={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        onSave={(data) => {
          if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
          }
        }}
      />
    </div>
  );
}
