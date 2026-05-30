'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type EventCategory = {
  id: string;
  name: string;
  slug: string;
};

type EventDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  location: string;
  price: number;
  capacity: number;
  category: { id: string; name: string; slug: string };
  thumbnailUrl: string | null;
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
};

const toDateTimeLocal = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : '';

const toIsoString = (value: string) => (value ? new Date(value).toISOString() : undefined);

export default function EditAdminEventPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<EventFormState | null>(null);

  const eventQuery = useQuery({
    queryKey: ['admin-event', id],
    queryFn: async () => {
      const response = await api.get(`/events/admin/${id}`);
      return response.data.data as EventDetail;
    },
    enabled: Boolean(id),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-event-categories-for-edit'],
    queryFn: async () => {
      const response = await api.get('/event-categories');
      return response.data.data as EventCategory[];
    },
  });

  useEffect(() => {
    if (!eventQuery.data) {
      return;
    }

    setForm({
      title: eventQuery.data.title,
      slug: eventQuery.data.slug,
      description: eventQuery.data.description,
      startDate: toDateTimeLocal(eventQuery.data.startDate),
      endDate: toDateTimeLocal(eventQuery.data.endDate),
      registrationDeadline: toDateTimeLocal(eventQuery.data.registrationDeadline),
      location: eventQuery.data.location,
      price: eventQuery.data.price,
      capacity: eventQuery.data.capacity,
      categoryId: eventQuery.data.category.id,
      thumbnailUrl: eventQuery.data.thumbnailUrl ?? '',
    });
  }, [eventQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!form) {
        return null;
      }

      const response = await api.patch(`/events/${id}`, {
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
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Event updated');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message ?? 'Failed to update event');
    },
  });

  if (eventQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (eventQuery.isError) {
    return (
      <ErrorState
        title="Failed to load event"
        description={eventQuery.error?.message ?? 'Something went wrong'}
        onRetry={() => void eventQuery.refetch()}
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Event categories unavailable"
        description="Reload categories before editing this event."
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  if (!form) {
    return <EmptyState title="Event not found" description="This event could not be loaded." />;
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Edit Event</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Update the event details shown to members and administrators.
        </p>
      </div>

      <Card>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              required
            />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Description</span>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-action focus:ring-2 focus:ring-brand-action/30"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Start"
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              required
            />
            <Input
              label="End"
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              required
            />
            <Input
              label="Registration deadline"
              name="registrationDeadline"
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(event) =>
                setForm({ ...form, registrationDeadline: event.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              required
            />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text-primary">Category</span>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                className="h-11 rounded-md border border-surface-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-action focus:ring-2 focus:ring-brand-action/30"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price (EGP)"
              name="price"
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            />
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
              required
            />
            <Input
              label="Thumbnail URL"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/events')}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || categories.length === 0}>
              {updateMutation.isPending ? 'Saving...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
