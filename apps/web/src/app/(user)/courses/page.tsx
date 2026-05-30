'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '@/components/cards/CourseCard';
import { FilterPill, PageHeader } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { Search, GraduationCap } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  totalDuration: number;
  lessonCount: number;
  enrollmentsCount: number;
  instructor: { name: string };
  category: { name: string };
  isEnrolled: boolean;
  isCompleted?: boolean;
}

type FilterKey = 'all' | 'free' | 'paid' | 'enrolled' | 'completed';

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
  { label: 'Enrolled', value: 'enrolled' },
  { label: 'Completed', value: 'completed' },
];

async function fetchCourses(params: Record<string, string>) {
  const { data } = await api.get('/courses', { params });
  return data;
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses', search],
    queryFn: () => fetchCourses({ search }),
  });

  const courses: CourseItem[] = data?.data?.data ?? data?.data ?? [];

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      switch (filter) {
        case 'all':
          return true;
        case 'free':
          return c.isFree;
        case 'paid':
          return !c.isFree;
        case 'enrolled':
          return c.isEnrolled;
        case 'completed':
          return Boolean(c.isCompleted);
        default:
          return true;
      }
    });
  }, [courses, filter]);

  const counts = useMemo(
    () =>
      ({
        all: courses.length,
        free: courses.filter((course) => course.isFree).length,
        paid: courses.filter((course) => !course.isFree).length,
        enrolled: courses.filter((course) => course.isEnrolled).length,
        completed: courses.filter((course) => course.isCompleted).length,
      }) satisfies Record<FilterKey, number>,
    [courses],
  );

  if (isLoading) return <LoadingSkeleton lines={6} variant="card" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load courses"
        description={error?.message ?? 'Something went wrong'}
        onRetry={refetch}
      />
    );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Courses"
        description="Explore AMG Academy courses, enrollments, and focused dental learning paths."
      />

      {/* Search */}
      <div className="glass rounded-3xl p-4">
        <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-surface-border/70 bg-surface-card/90 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/15"
        />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <FilterPill
            key={f.value}
            onClick={() => setFilter(f.value)}
            active={filter === f.value}
            count={counts[f.value]}
          >
            {f.label}
          </FilterPill>
        ))}
      </div>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description={search ? 'Try a different search term.' : 'No courses are available at this time.'}
          icon={<GraduationCap className="h-7 w-7" />}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
