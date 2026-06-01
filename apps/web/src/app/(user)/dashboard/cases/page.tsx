'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  ChevronUp,
  FileText,
  MessageSquare,
  PlusCircle,
  Search,
} from 'lucide-react';
import { Badge, Button, Card, FilterPill, Input, PageHeader } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

interface CaseListItem {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  categoryId: string;
  categoryName: string;
  tags: string[];
  status: string;
  imageCount: number;
  commentCount: number;
  upvoteCount: number;
  isUpvoted: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface CaseCategory {
  id: string;
  name: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CaseForumPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const casesQuery = useQuery({
    queryKey: ['cases', search, categoryFilter],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {
        limit: '25',
        search: search || undefined,
      };
      if (categoryFilter !== 'all') {
        params.categoryId = categoryFilter;
      }
      const { data } = await api.get('/cases', { params });
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['case-categories'],
    queryFn: async () => {
      const { data } = await api.get('/case-categories');
      return data;
    },
  });

  const cases: CaseListItem[] = useMemo(() => {
    const payload = casesQuery.data;
    const list = payload?.data ?? payload ?? [];
    return Array.isArray(list) ? list : [];
  }, [casesQuery.data]);

  const categories: CaseCategory[] = useMemo(() => {
    const payload = categoriesQuery.data;
    const list = payload?.data ?? payload ?? [];
    return Array.isArray(list) ? list : [];
  }, [categoriesQuery.data]);

  if (casesQuery.isLoading) return <LoadingSkeleton lines={6} variant="card" />;
  if (casesQuery.isError) {
    return (
      <ErrorState
        title="Failed to load cases"
        description={casesQuery.error?.message ?? 'Something went wrong'}
        onRetry={casesQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Forum"
        accent="Community"
        description="Explore clinical cases shared by the AMG community. Learn from peers and share your own experiences."
        actions={
          <Link href="/dashboard/cases/submit">
            <Button variant="glow" size="sm">
              <PlusCircle className="h-4 w-4" />
              Submit Case
            </Button>
          </Link>
        }
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                active={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.name}
              </FilterPill>
            ))}
          </div>
        </div>
      </Card>

      {cases.length === 0 ? (
        <EmptyState
          title="No cases yet"
          description="There are no approved cases matching your search. Be the first to submit one!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
              <Card variant="action" className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-semibold text-text-primary line-clamp-2">
                    {c.title}
                  </h3>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2">
                  {c.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {c.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="muted" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {c.tags.length > 4 ? (
                    <Badge variant="muted" size="sm">
                      +{c.tags.length - 4}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <ChevronUp className="h-3.5 w-3.5" />
                      {c.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {c.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <Badge variant="info" size="sm">
                    {c.categoryName}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="font-medium text-text-secondary">{c.authorName}</span>
                  <span>&middot;</span>
                  <span>{formatDate(c.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
