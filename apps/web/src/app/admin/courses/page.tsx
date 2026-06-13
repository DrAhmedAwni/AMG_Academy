'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { DataTable } from '@/components/tables/DataTable';
import { Button, FilterPill, Modal, Badge, PageHeader } from '@/components/ui';
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
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () => fetchCourses({ search }),
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

  const courses: Course[] = data?.data?.data ?? data?.data ?? [];
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
      className: 'w-[30%]',
      cell: (c: Course) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated/50 text-text-muted">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{c.title}</p>
            <p className="truncate text-xs text-text-muted">{c.category.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'instructor',
      header: 'Instructor',
      className: 'w-[18%]',
      cell: (c: Course) => (
        <span className="truncate text-sm text-text-secondary">{c.instructor.name}</span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      className: 'w-[10%]',
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
      className: 'w-[10%]',
      cell: (c: Course) => <StatusBadge status={c.status} />,
    },
    {
      id: 'lessons',
      header: 'Lessons',
      className: 'w-[8%]',
      cell: (c: Course) => (
        <span className="text-sm text-text-secondary">{c.lessonCount}</span>
      ),
    },
    {
      id: 'enrollments',
      header: 'Enrolled',
      className: 'w-[8%]',
      cell: (c: Course) => (
        <span className="text-sm text-text-secondary">{c.enrollmentsCount}</span>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSkeleton lines={6} variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load courses"
        description={error?.message ?? 'Something went wrong while loading course data.'}
        onRetry={() => refetch()}
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
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Link href="/admin/courses/new">
              <Button variant="gold" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Course
              </Button>
            </Link>
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
          className="w-full rounded-2xl border border-surface-border/70 bg-surface-card/90 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15"
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
              <Link href={`/admin/courses/${course.id}/edit`}>
                <Button variant="ghost" size="sm" icon>
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
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


