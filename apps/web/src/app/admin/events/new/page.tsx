'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type EventCategory = {
  id: string;
  name: string;
  slug: string;
};

type EventFormState = {
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  price: number;
  capacity: number;
  categoryId: string;
  thumbnailUrl: string;
  publishNow: boolean;
};

const toIsoString = (value: string) => (value ? new Date(value).toISOString() : undefined);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function NewAdminEventPage() {
  const router = useRouter();
  const defaultDates = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 30);
    start.setHours(10, 0, 0, 0);

    const end = new Date(start);
    end.setHours(16, 0, 0, 0);

    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() - 2);
    deadline.setHours(23, 0, 0, 0);

    return {
      startDate: start.toISOString().slice(0, 16),
      endDate: end.toISOString().slice(0, 16),
      registrationDeadline: deadline.toISOString().slice(0, 16),
    };
  }, []);

  const [form, setForm] = useState<EventFormState>({
    title: '',
    slug: '',
    description: '',
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    registrationDeadline: defaultDates.registrationDeadline,
    location: '',
    price: 0,
    capacity: 100,
    categoryId: '',
    thumbnailUrl: '',
    publishNow: true,
  });
  const [newCategoryName, setNewCategoryName] = useState('Clinical Congress');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const categoriesQuery = useQuery({
    queryKey: ['admin-event-categories-for-create'],
    queryFn: async () => {
      const response = await api.get('/event-categories');
      const payload = response.data?.data ?? response.data;
      return (Array.isArray(payload) ? payload : payload?.data ?? []) as EventCategory[];
    },
  });

  const categories = categoriesQuery.data ?? [];

  useEffect(() => {
    if (!form.categoryId && categories.length > 0) {
      setForm((current) => ({ ...current, categoryId: categories[0]!.id }));
    }
  }, [categories, form.categoryId]);

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const name = newCategoryName.trim();
      const response = await api.post('/event-categories', {
        name,
        slug: slugify(name || `event-category-${Date.now()}`),
        description: 'AMG Academy event category',
      });
      return (response.data?.data?.data ?? response.data?.data ?? response.data) as EventCategory;
    },
    onSuccess: (category) => {
      toast.success('Event category created');
      setForm((current) => ({ ...current, categoryId: category.id }));
      void categoriesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message ?? 'Failed to create category');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const errors: Record<string, string> = {};
      if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
      if (form.slug.trim().length < 2) errors.slug = 'Slug must be at least 2 characters';
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Slug must be lowercase kebab-case';
      if (form.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
      if (!form.startDate) errors.startDate = 'Start date is required';
      if (!form.endDate) errors.endDate = 'End date is required';
      if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) errors.endDate = 'End date must be after start date';
      if (!form.location.trim()) errors.location = 'Location is required';
      if (!form.categoryId) errors.categoryId = 'Category is required';
      if (form.capacity < 1) errors.capacity = 'Capacity must be at least 1';

      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) throw new Error('validation');

      const created = await api.post('/events', {
        title: form.title,
        slug: form.slug,
        description: form.description,
        startDate: toIsoString(form.startDate),
        endDate: toIsoString(form.endDate),
        registrationDeadline: toIsoString(form.registrationDeadline),
        location: form.location,
        price: form.price,
        capacity: form.capacity,
        categoryId: form.categoryId,
        thumbnailUrl: form.thumbnailUrl || undefined,
      });

      const event = created.data.data;
      if (form.publishNow) {
        await api.post(`/events/${event.id}/publish`);
      }
      return event;
    },
    onSuccess: () => {
      toast.success(form.publishNow ? 'Event created and published' : 'Event created');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (error: any) => {
      if (error?.message !== 'validation') {
        toast.error(error?.response?.data?.error?.message ?? 'Failed to create event');
      }
    },
  });

  if (categoriesQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Event categories unavailable"
        description="Create or reload categories before adding an event."
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Create Event</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Add a free or paid academy event and publish it for registration.
        </p>
      </div>

      {categories.length === 0 && (
        <Card className="border-amber-400/35 bg-amber-400/10">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <Input
              label="Create the first event category"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              loading={createCategoryMutation.isPending}
              disabled={!newCategoryName.trim()}
              onClick={() => createCategoryMutation.mutate()}
            >
              Create category
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              name="title"
              value={form.title}
              error={fieldErrors.title}
              onChange={(event) => { setForm({ ...form, title: event.target.value }); clearError('title'); }}
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={form.slug}
              error={fieldErrors.slug}
              onChange={(event) => { setForm({ ...form, slug: event.target.value }); clearError('slug'); }}
              required
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Description (min 20 characters)</span>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={(event) => { setForm({ ...form, description: event.target.value }); clearError('description'); }}
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 ${
                fieldErrors.description
                  ? 'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20'
                  : 'border-surface-border focus:border-brand-action focus:ring-brand-action/30'
              }`}
              required
            />
            {fieldErrors.description ? <span className="text-xs text-status-error">{fieldErrors.description}</span> : null}
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Start"
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              error={fieldErrors.startDate}
              onChange={(event) => { setForm({ ...form, startDate: event.target.value }); clearError('startDate'); }}
              required
            />
            <Input
              label="End"
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              error={fieldErrors.endDate}
              onChange={(event) => { setForm({ ...form, endDate: event.target.value }); clearError('endDate'); }}
              required
            />
            <Input
              label="Registration deadline"
              name="registrationDeadline"
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(event) => { setForm({ ...form, registrationDeadline: event.target.value }); clearError('registrationDeadline'); }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Location"
              name="location"
              value={form.location}
              error={fieldErrors.location}
              onChange={(event) => { setForm({ ...form, location: event.target.value }); clearError('location'); }}
              required
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text-primary">Category</span>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={(event) => { setForm({ ...form, categoryId: event.target.value }); clearError('categoryId'); }}
                className={`h-11 rounded-md border bg-surface px-3 text-sm text-text-primary outline-none focus:ring-2 ${
                  fieldErrors.categoryId
                    ? 'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20'
                    : 'border-surface-border focus:border-brand-action focus:ring-brand-action/30'
                }`}
                disabled={categories.length === 0}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId ? <span className="text-xs text-status-error">{fieldErrors.categoryId}</span> : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price (EGP)"
              name="price"
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => { setForm({ ...form, price: Number(event.target.value) }); clearError('price'); }}
            />
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              min={1}
              value={form.capacity}
              error={fieldErrors.capacity}
              onChange={(event) => { setForm({ ...form, capacity: Number(event.target.value) }); clearError('capacity'); }}
              required
            />
            <Input
              label="Thumbnail URL"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={(event) => { setForm({ ...form, thumbnailUrl: event.target.value }); clearError('thumbnailUrl'); }}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-text-secondary">
            <input
              name="publishNow"
              type="checkbox"
              checked={form.publishNow}
              onChange={(event) => setForm({ ...form, publishNow: event.target.checked })}
            />
            <span>Publish immediately</span>
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/events')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !form.categoryId}>
              {createMutation.isPending ? 'Saving...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
