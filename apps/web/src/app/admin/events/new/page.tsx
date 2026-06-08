'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)\//);
  const fileId = fileMatch?.[1];
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([^&]+)/);
    const extractedId = idMatch?.[1];
    if (!extractedId) return url;
    return `https://drive.google.com/thumbnail?id=${extractedId}&sz=w1000`;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });

const defaultDates = () => {
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
};

export default function NewAdminEventPage() {
  const router = useRouter();
  const initDates = useMemo(() => defaultDates(), []);

  const [form, setForm] = useState<EventFormState>({
    title: '',
    slug: '',
    description: '',
    startDate: initDates.startDate,
    endDate: initDates.endDate,
    registrationDeadline: initDates.registrationDeadline,
    location: '',
    price: 0,
    capacity: 100,
    categoryId: '',
    thumbnailUrl: '',
    publishNow: true,
  });
  const [newCategoryName, setNewCategoryName] = useState('Clinical Congress');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = (field: string) => setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingImage(true);
    try {
      const dataUrl = await compressImage(file);
      setImagePreview(dataUrl);
      setImageError(false);
      setForm({ ...form, thumbnailUrl: dataUrl });
    } catch {
      toast.error('Failed to process image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      setShowNewCategory(false);
      void categoriesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message ?? 'Failed to create category');
    },
  });

  const handleImageUrlChange = (url: string) => {
    setForm({ ...form, thumbnailUrl: url });
    if (url) {
      setImagePreview(convertGoogleDriveUrl(url));
      setImageError(false);
    } else {
      setImagePreview(null);
      setImageError(false);
    }
  };

  const handleClearImage = () => {
    setForm({ ...form, thumbnailUrl: '' });
    setImagePreview(null);
    setImageError(false);
  };

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
      if (form.startDate && form.registrationDeadline && new Date(form.registrationDeadline) >= new Date(form.startDate)) errors.registrationDeadline = 'Registration deadline must be before start date';
      if (!form.location.trim()) errors.location = 'Location is required';
      if (!form.categoryId) errors.categoryId = 'Category is required';
      if (form.capacity < 1) errors.capacity = 'Capacity must be at least 1';

      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) throw new Error('validation');

      const thumbnailUrl = form.thumbnailUrl
        ? convertGoogleDriveUrl(form.thumbnailUrl)
        : undefined;

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
        thumbnailUrl,
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
        const apiError = error?.response?.data?.error;
        const details = apiError?.details;
        if (details?.length > 0) {
          const messages = details.map((d: any) => `${d.field}: ${d.message}`).join('\n');
          toast.error(messages);
        } else {
          toast.error(apiError?.message ?? 'Failed to create event');
        }
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
              label="Registration deadline"
              name="registrationDeadline"
              type="datetime-local"
              value={form.registrationDeadline}
              error={fieldErrors.registrationDeadline}
              onChange={(event) => { setForm({ ...form, registrationDeadline: event.target.value }); clearError('registrationDeadline'); }}
            />
            <Input
              label="Start date & time"
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              error={fieldErrors.startDate}
              onChange={(event) => { setForm({ ...form, startDate: event.target.value }); clearError('startDate'); }}
              required
            />
            <Input
              label="End date & time"
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              error={fieldErrors.endDate}
              onChange={(event) => { setForm({ ...form, endDate: event.target.value }); clearError('endDate'); }}
              required
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
              <div className="flex gap-2">
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(event) => { setForm({ ...form, categoryId: event.target.value }); clearError('categoryId'); }}
                  className={`h-11 flex-1 rounded-md border bg-surface px-3 text-sm text-text-primary outline-none focus:ring-2 ${
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  {showNewCategory ? 'Cancel' : 'New'}
                </Button>
              </div>
              {fieldErrors.categoryId ? <span className="text-xs text-status-error">{fieldErrors.categoryId}</span> : null}
            </label>
          </div>

          {showNewCategory && (
            <Card className="border-amber-400/35 bg-amber-400/10">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <Input
                  label="New category name"
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
                  Create
                </Button>
              </div>
            </Card>
          )}

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
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Event Image</span>
            <div className="flex gap-2">
              <Input
                name="thumbnailUrl"
                placeholder="Paste Google Drive shared link or direct image URL"
                value={form.thumbnailUrl}
                onChange={(event) => handleImageUrlChange(event.target.value)}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingImage ? 'Processing...' : 'Upload'}
              </Button>
              {imagePreview && (
                <Button type="button" variant="ghost" onClick={handleClearImage}>
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-text-muted">
              Paste a Google Drive shared link or upload an image directly (max 5MB). Google Drive links are converted to thumbnail URLs automatically. Uploaded images are compressed to ~100-200KB.
            </p>
          </label>

          {imagePreview && (
            <div className="relative overflow-hidden rounded-md border border-surface-border">
              {imageError ? (
                <div className="flex h-48 items-center justify-center bg-surface-secondary">
                  <div className="text-center">
                    <svg className="mx-auto mb-2 h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-sm text-text-muted">Could not load image — check the URL</p>
                  </div>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="max-h-48 w-full object-contain"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          )}

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
