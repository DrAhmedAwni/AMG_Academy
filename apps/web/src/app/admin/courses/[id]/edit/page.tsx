'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type CourseCategory = { id: string; name: string; slug: string };
type Instructor = { id: string; name: string; email: string; role?: string };

type Course = {
  id: string; title: string; slug: string; description: string;
  thumbnailUrl: string | null; price: number; isFree: boolean;
  instructor: { id: string; name: string };
  category: { id: string; name: string };
};

const slugify = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)\//);
  const fileId = fileMatch?.[1];
  if (!fileId) { const m = url.match(/[?&]id=([^&]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : url; }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); const canvas = document.createElement('canvas'); const scale = Math.min(maxWidth / img.width, 1); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale); canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', quality)); };
    img.onerror = () => reject(new Error('Failed to load image')); img.src = url;
  });

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const courseQuery = useQuery({
    queryKey: ['admin-course', id],
    queryFn: async () => { const { data } = await api.get(`/courses/admin/${id}`); return (data?.data ?? data) as Course; },
    enabled: !!id,
  });

  const categoriesQuery = useQuery({
    queryKey: ['course-categories'], queryFn: async () => { const { data } = await api.get('/course-categories'); const u = data?.data ?? data; return (Array.isArray(u) ? u : u?.data ?? []) as CourseCategory[]; },
  });

  const instructorsQuery = useQuery({
    queryKey: ['course-instructors'], queryFn: async () => { const { data } = await api.get('/users', { params: { page: 1, limit: 100, status: 'active' } }); const u = data?.data ?? data; return (Array.isArray(u) ? u : u?.data ?? []) as Instructor[]; },
  });

  const categories = categoriesQuery.data ?? [];
  const instructors = instructorsQuery.data ?? [];

  const [form, setForm] = useState({ title: '', description: '', instructorId: '', categoryId: '', price: 0, thumbnailUrl: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('General Dentistry');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (courseQuery.data) {
      const c = courseQuery.data;
      setForm({ title: c.title, description: c.description, instructorId: c.instructor?.id ?? '', categoryId: c.category?.id ?? '', price: c.price, thumbnailUrl: c.thumbnailUrl ?? '' });
      if (c.thumbnailUrl) { setImagePreview(convertGoogleDriveUrl(c.thumbnailUrl)); setImageError(false); }
    }
  }, [courseQuery.data]);

  const clearError = (f: string) => setFieldErrors((p) => { const n = { ...p }; delete n[f]; return n; });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const errors: Record<string, string> = {};
      if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
      if (form.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
      if (!form.instructorId) errors.instructorId = 'Instructor is required';
      if (!form.categoryId) errors.categoryId = 'Category is required';
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) throw new Error('validation');
      const { data } = await api.patch(`/courses/${id}`, {
        title: form.title, description: form.description, instructorId: form.instructorId,
        categoryId: form.categoryId, price: Number(form.price), thumbnailUrl: form.thumbnailUrl || undefined,
      });
      return data;
    },
    onSuccess: () => { toast.success('Course updated'); router.push('/admin/courses'); router.refresh(); },
    onError: (error: any) => { if (error?.message !== 'validation') toast.error(error?.response?.data?.error?.message ?? 'Failed to update course'); },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => { const name = newCategoryName.trim(); const { data } = await api.post('/course-categories', { name, slug: slugify(name || `cat-${Date.now()}`), description: 'AMG Academy course category' }); return (data?.data?.data ?? data?.data ?? data) as CourseCategory; },
    onSuccess: (cat) => { toast.success('Category created'); setForm((c) => ({ ...c, categoryId: cat.id })); setShowNewCategory(false); void categoriesQuery.refetch(); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed'),
  });

  const handleImageUrlChange = (url: string) => {
    setForm({ ...form, thumbnailUrl: url });
    if (url) { setImagePreview(convertGoogleDriveUrl(url)); setImageError(false); } else { setImagePreview(null); setImageError(false); }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploadingImage(true);
    try { const dataUrl = await compressImage(file); setImagePreview(dataUrl); setImageError(false); setForm({ ...form, thumbnailUrl: dataUrl }); }
    catch { toast.error('Failed to process image'); }
    finally { setUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleClearImage = () => { setForm({ ...form, thumbnailUrl: '' }); setImagePreview(null); setImageError(false); };

  if (courseQuery.isLoading || categoriesQuery.isLoading || instructorsQuery.isLoading) return <LoadingSkeleton lines={6} />;
  if (courseQuery.isError) return <ErrorState title="Course not found" description="Could not load course." onRetry={() => void courseQuery.refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Edit Course</h1>
        <p className="mt-2 text-sm text-text-secondary">Update course details, pricing, and instructor.</p>
      </div>
      <Card>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }}>
          <Input label="Title" value={form.title} error={fieldErrors.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); clearError('title'); }} required />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Description (min 20 characters)</span>
            <textarea rows={5} value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); clearError('description'); }}
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 ${fieldErrors.description ? 'border-status-error/50' : 'border-surface-border focus:border-brand-action'}`} required />
            {fieldErrors.description ? <span className="text-xs text-status-error">{fieldErrors.description}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Instructor</span>
            <select value={form.instructorId}
              onChange={(e) => { setForm({ ...form, instructorId: e.target.value }); clearError('instructorId'); }}
              className="h-11 rounded-md border border-surface-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-action focus:ring-2 focus:ring-brand-action/30" required>
              <option value="">Select instructor</option>
              {instructors.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.role ?? i.email})</option>)}
            </select>
            {fieldErrors.instructorId ? <span className="text-xs text-status-error">{fieldErrors.instructorId}</span> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Category</span>
            <div className="flex gap-2">
              <select value={form.categoryId}
                onChange={(e) => { setForm({ ...form, categoryId: e.target.value }); clearError('categoryId'); }}
                className="h-11 flex-1 rounded-md border border-surface-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-action focus:ring-2 focus:ring-brand-action/30" required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button type="button" variant="secondary" onClick={() => setShowNewCategory(!showNewCategory)}>
                {showNewCategory ? 'Cancel' : 'New'}
              </Button>
            </div>
          </label>

          {showNewCategory && (
            <Card className="border-amber-400/35 bg-amber-400/10">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <Input label="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                <Button type="button" variant="secondary" loading={createCategoryMutation.isPending} disabled={!newCategoryName.trim()} onClick={() => createCategoryMutation.mutate()}>Create</Button>
              </div>
            </Card>
          )}

          <Input label="Price (EGP)" type="number" min={0} value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">Course Image</span>
            <div className="flex gap-2">
              <Input placeholder="Paste Google Drive shared link" value={form.thumbnailUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)} />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <Button type="button" variant="secondary" disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}>{uploadingImage ? 'Processing...' : 'Upload'}</Button>
              {imagePreview && <Button type="button" variant="ghost" onClick={handleClearImage}>Clear</Button>}
            </div>
            <p className="text-xs text-text-muted">Paste a Google Drive shared link or upload an image (max 5MB).</p>
            {imagePreview && (
              <div className="relative overflow-hidden rounded-md border border-surface-border">
                {imageError ? <div className="flex h-40 items-center justify-center bg-surface-secondary"><p className="text-sm text-text-muted">Could not load image</p></div> :
                  <img src={imagePreview} alt="" className="max-h-40 w-full object-cover" onError={() => setImageError(true)} />}
              </div>
            )}
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/courses')}>Cancel</Button>
            <Button type="submit" disabled={updateMutation.isPending || !form.instructorId || !form.categoryId}>
              {updateMutation.isPending ? 'Saving...' : 'Update Course'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
