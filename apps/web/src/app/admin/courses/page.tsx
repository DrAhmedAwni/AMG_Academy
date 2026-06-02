'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { DataTable } from '@/components/tables/DataTable';
import { Button, FilterPill, Input, Modal, Badge, PageHeader } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton, ErrorState, EmptyState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Archive,
  Trash2,
  Eye,
  BookOpen,
  Search,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  isFree: boolean;
  status: string;
  totalDuration: number;
  lessonCount: number;
  enrollmentsCount: number;
  instructor: { id: string; name: string };
  category: { id: string; name: string };
}

interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

interface InstructorOption {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
}

type CourseFilter = 'all' | 'draft' | 'published' | 'archived' | 'free' | 'paid';

const FILTERS: { label: string; value: CourseFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

async function fetchCourses(params: Record<string, string>) {
  const { data } = await api.get('/courses/admin', { params });
  return data;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function convertGoogleDriveUrl(url: string): string {
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
}

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
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
}

function readCollection<T>(payload: any): T[] {
  const unwrapped = payload?.data ?? payload;
  if (Array.isArray(unwrapped)) return unwrapped;
  if (Array.isArray(unwrapped?.data)) return unwrapped.data;
  if (Array.isArray(unwrapped?.items)) return unwrapped.items;
  return [];
}

async function fetchCourseCategories() {
  const { data } = await api.get('/course-categories');
  return readCollection<CourseCategory>(data);
}

async function fetchInstructorOptions() {
  const { data } = await api.get('/users', {
    params: { page: 1, limit: 100, status: 'active' },
  });
  return readCollection<InstructorOption>(data);
}

async function createCourseCategory(name: string) {
  const categoryName = name.trim();
  const { data } = await api.post('/course-categories', {
    name: categoryName,
    slug: slugify(categoryName || `course-category-${Date.now()}`),
    description: 'AMG Academy course category',
  });
  return (data?.data?.data ?? data?.data ?? data) as CourseCategory;
}

async function createCourse(body: Record<string, unknown>) {
  const { data } = await api.post('/courses', body);
  return data;
}

async function updateCourse(id: string, body: Record<string, unknown>) {
  const { data } = await api.patch(`/courses/${id}`, body);
  return data;
}

async function deleteCourse(id: string) {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
}

async function publishCourse(id: string) {
  const { data } = await api.post(`/courses/${id}/publish`);
  return data;
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CourseFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () => fetchCourses({ search }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['course-categories'],
    queryFn: fetchCourseCategories,
  });

  const instructorsQuery = useQuery({
    queryKey: ['course-instructors'],
    queryFn: fetchInstructorOptions,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success('Course created');
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateCourse(id, body),
    onSuccess: () => {
      toast.success('Course updated');
      setEditingCourse(null);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      toast.success('Course archived');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to archive'),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/courses/${id}/hard`);
      return data;
    },
    onSuccess: () => {
      toast.success('Course deleted permanently');
      setHardDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to delete'),
  });

  const publishMutation = useMutation({
    mutationFn: publishCourse,
    onSuccess: () => {
      toast.success('Course published');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to publish'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCourseCategory,
    onSuccess: () => {
      toast.success('Course category created');
      queryClient.invalidateQueries({ queryKey: ['course-categories'] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error?.message ?? 'Failed to create category'),
  });

  const courses: Course[] = data?.data?.data ?? data?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const instructors = instructorsQuery.data ?? [];
  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        switch (filter) {
          case 'draft':
            return course.status.toLowerCase() === 'draft';
          case 'published':
            return course.status.toLowerCase() === 'published';
          case 'archived':
            return course.status.toLowerCase() === 'archived';
          case 'free':
            return course.isFree;
          case 'paid':
            return !course.isFree;
          default:
            return true;
        }
      }),
    [courses, filter],
  );

  const counts = useMemo(
    () =>
      ({
        all: courses.length,
        draft: courses.filter((course) => course.status.toLowerCase() === 'draft').length,
        published: courses.filter((course) => course.status.toLowerCase() === 'published').length,
        archived: courses.filter((course) => course.status.toLowerCase() === 'archived').length,
        free: courses.filter((course) => course.isFree).length,
        paid: courses.filter((course) => !course.isFree).length,
      }) satisfies Record<CourseFilter, number>,
    [courses],
  );

  const columns = [
    {
      id: 'title',
      header: 'Course',
      cell: (c: Course) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated/50 text-text-muted">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{c.title}</p>
            <p className="text-xs text-text-muted">{c.category.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'instructor',
      header: 'Instructor',
      cell: (c: Course) => (
        <span className="text-sm text-text-secondary">{c.instructor.name}</span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      cell: (c: Course) =>
        c.isFree ? (
          <Badge variant="success">Free</Badge>
        ) : (
          <span className="text-sm text-text-primary">
            {c.price} EGP
          </span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c: Course) => <StatusBadge status={c.status} />,
    },
    {
      id: 'lessons',
      header: 'Lessons',
      cell: (c: Course) => (
        <span className="text-sm text-text-secondary">{c.lessonCount}</span>
      ),
    },
    {
      id: 'enrollments',
      header: 'Enrolled',
      cell: (c: Course) => (
        <span className="text-sm text-text-secondary">{c.enrollmentsCount}</span>
      ),
    },
  ];

  if (isLoading || categoriesQuery.isLoading || instructorsQuery.isLoading) {
    return <LoadingSkeleton lines={6} variant="table" />;
  }

  if (isError || categoriesQuery.isError || instructorsQuery.isError) {
    return (
      <ErrorState
        title="Failed to load courses"
        description={error?.message ?? 'Something went wrong while loading course data.'}
        onRetry={() => {
          void refetch();
          void categoriesQuery.refetch();
          void instructorsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Courses"
        accent="Management"
        description="Manage courses, lessons, pricing, publication status, and enrollment visibility."
        actions={
          <>
            <Button variant="glass" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <FilterPill
            key={item.value}
            active={filter === item.value}
            count={counts[item.value]}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </FilterPill>
        ))}
      </div>

      {/* Search */}
      <div className="glass relative max-w-md rounded-3xl p-4">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-surface-border/70 bg-surface-card/90 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/15"
        />
      </div>

      {/* Table */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to get started."
          icon={<GraduationCap className="h-7 w-7" />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCourses}
          rowKey={(course) => course.id}
          rowActions={(course: Course) => (
            <div className="flex items-center gap-1">
              <Link href={`/courses/${course.slug}`} target="_blank">
                <Button variant="ghost" size="sm" icon>
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/admin/lessons?courseId=${course.id}`}>
                <Button variant="ghost" size="sm" icon>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
              {course.status.toLowerCase() !== 'published' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => publishMutation.mutate(course.id)}
                >
                  Publish
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon
                onClick={() => setEditingCourse(course)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon
                onClick={() => setDeleteTarget(course)}
              >
                <Archive className="h-4 w-4 text-status-error/70" />
              </Button>
              {course.enrollmentsCount === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon
                  onClick={() => setHardDeleteTarget(course)}
                >
                  <Trash2 className="h-4 w-4 text-status-error/70" />
                </Button>
              )}
            </div>
          )}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CourseFormModal
          title="Create Course"
          onClose={() => setShowCreateModal(false)}
          onSubmit={(body) => createMutation.mutate(body)}
          isSubmitting={createMutation.isPending}
          categories={categories}
          instructors={instructors}
          onCreateCategory={(name) => createCategoryMutation.mutateAsync(name)}
          isCreatingCategory={createCategoryMutation.isPending}
        />
      )}

      {/* Edit Modal */}
      {editingCourse && (
        <CourseFormModal
          title="Edit Course"
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={(body) =>
            updateMutation.mutate({ id: editingCourse.id, body })
          }
          isSubmitting={updateMutation.isPending}
          categories={categories}
          instructors={instructors}
          onCreateCategory={(name) => createCategoryMutation.mutateAsync(name)}
          isCreatingCategory={createCategoryMutation.isPending}
        />
      )}

      {deleteTarget && (
        <Modal
          open
          title="Archive course?"
          description={`This will archive "${deleteTarget.title}" and remove it from the active catalog.`}
          onClose={() => setDeleteTarget(null)}
          maxWidth="sm"
        >
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
              loading={deleteMutation.isPending}
            >
              Archive
            </Button>
          </div>
        </Modal>
      )}

      {hardDeleteTarget && (
        <Modal
          open
          title="Delete course permanently?"
          description={`This will permanently delete "${hardDeleteTarget.title}" including all lessons. This cannot be undone.`}
          onClose={() => setHardDeleteTarget(null)}
          maxWidth="sm"
        >
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setHardDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => hardDeleteMutation.mutate(hardDeleteTarget.id)}
              loading={hardDeleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CourseFormModal({
  title,
  course,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
  instructors,
  onCreateCategory,
  isCreatingCategory,
}: {
  title: string;
  course?: Course;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  isSubmitting: boolean;
  categories: CourseCategory[];
  instructors: InstructorOption[];
  onCreateCategory: (name: string) => Promise<CourseCategory>;
  isCreatingCategory: boolean;
}) {
  const [form, setForm] = useState({
    title: course?.title ?? '',
    slug: course?.slug ?? '',
    description: course?.description ?? '',
    instructorId: course?.instructor?.id ?? instructors[0]?.id ?? '',
    categoryId: course?.category?.id ?? categories[0]?.id ?? '',
    thumbnailUrl: course?.thumbnailUrl ?? '',
    price: course?.price ?? 0,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState('General Dentistry');
  const [imagePreview, setImagePreview] = useState<string | null>(course?.thumbnailUrl ? convertGoogleDriveUrl(course.thumbnailUrl) : null);
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = (field: string) => setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      instructorId: current.instructorId || course?.instructor?.id || instructors[0]?.id || '',
      categoryId: current.categoryId || course?.category?.id || categories[0]?.id || '',
    }));
  }, [categories, course?.category?.id, course?.instructor?.id, instructors]);

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    if (!course && form.slug.trim().length < 2) errors.slug = 'Slug must be at least 2 characters';
    else if (!course && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Slug must be lowercase kebab-case';
    if (form.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
    if (!form.instructorId) errors.instructorId = 'Instructor is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      instructorId: form.instructorId,
      categoryId: form.categoryId,
      thumbnailUrl: form.thumbnailUrl || undefined,
      price: Number(form.price),
    };

    if (!course) {
      body.slug = form.slug;
    }

    onSubmit(body);
  };

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

  const handleClearImage = () => {
    setForm({ ...form, thumbnailUrl: '' });
    setImagePreview(null);
    setImageError(false);
  };

  const handleCreateCategory = async () => {
    const category = await onCreateCategory(newCategoryName);
    setForm((current) => ({ ...current, categoryId: category.id }));
    setShowNewCategory(false);
  };

  return (
    <Modal open title={title} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          error={fieldErrors.title}
          onChange={(e) => { setForm({ ...form, title: e.target.value }); clearError('title'); }}
          required
        />
        {!course && (
          <Input
            label="Slug"
            value={form.slug}
            error={fieldErrors.slug}
            onChange={(e) => { setForm({ ...form, slug: e.target.value }); clearError('slug'); }}
            required
          />
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">
            Description (min 20 characters)
          </span>
          <textarea
            className={`w-full rounded-lg border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 ${
              fieldErrors.description
                ? 'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20'
                : 'border-surface-border/60 focus:border-cyan/50 focus:ring-cyan/20'
            }`}
            rows={4}
            placeholder="Course description"
            value={form.description}
            onChange={(e) => { setForm({ ...form, description: e.target.value }); clearError('description'); }}
          />
          {fieldErrors.description ? <span className="text-xs text-status-error">{fieldErrors.description}</span> : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Instructor</span>
          <select
            value={form.instructorId}
            onChange={(e) => { setForm({ ...form, instructorId: e.target.value }); clearError('instructorId'); }}
            className={`h-11 rounded-lg border bg-surface-card px-3 text-sm text-text-primary outline-none focus:ring-2 ${
              fieldErrors.instructorId
                ? 'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20'
                : 'border-surface-border/60 focus:border-cyan/50 focus:ring-cyan/20'
            }`}
            required
          >
            <option value="" disabled>
              Select instructor
            </option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name} ({instructor.role ?? instructor.email})
              </option>
            ))}
          </select>
          {fieldErrors.instructorId ? <span className="text-xs text-status-error">{fieldErrors.instructorId}</span> : null}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Category</span>
          <div className="flex gap-2">
            <select
              value={form.categoryId}
              onChange={(e) => { setForm({ ...form, categoryId: e.target.value }); clearError('categoryId'); }}
              className={`h-11 flex-1 rounded-lg border bg-surface-card px-3 text-sm text-text-primary outline-none focus:ring-2 ${
                fieldErrors.categoryId
                  ? 'border-status-error/50 focus:border-status-error/60 focus:ring-status-error/20'
                  : 'border-surface-border/60 focus:border-cyan/50 focus:ring-cyan/20'
              }`}
              required
            >
              <option value="" disabled>
                Select category
              </option>
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

        {showNewCategory && (
          <div className="rounded-lg border border-amber-400/35 bg-amber-400/10 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                label="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                loading={isCreatingCategory}
                disabled={!newCategoryName.trim()}
                onClick={() => void handleCreateCategory()}
              >
                Create
              </Button>
            </div>
          </div>
        )}

        {instructors.length === 0 && (
          <p className="rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-sm text-text-secondary">
            Add or activate an instructor/admin user before saving this course.
          </p>
        )}

        <Input
          label="Price (EGP)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Course Image</span>
          <div className="flex gap-2">
            <Input
              name="thumbnailUrl"
              placeholder="Paste Google Drive shared link or direct image URL"
              value={form.thumbnailUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
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
            Paste a Google Drive shared link or upload an image directly (max 5MB). Uploaded images are compressed to ~100-200KB.
          </p>
          {imagePreview && (
            <div className="relative overflow-hidden rounded-md border border-surface-border">
              {imageError ? (
                <div className="flex h-40 items-center justify-center bg-surface-secondary">
                  <p className="text-sm text-text-muted">Could not load image — check the URL</p>
                </div>
              ) : (
                <img
                  src={imagePreview}
                  alt="Course preview"
                  className="max-h-40 w-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          )}
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !form.instructorId || !form.categoryId}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
