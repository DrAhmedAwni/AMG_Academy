'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';

async function fetchContentPage(slug: string) {
  const { data } = await api.get(`/content-pages/${slug}`);
  return data;
}

export default function ContentPageViewer() {
  const { slug } = useParams() as { slug: string };
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['content-page', slug],
    queryFn: () => fetchContentPage(slug),
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load page" description={error?.message ?? ''} onRetry={refetch} />;
  if (!data) return <EmptyState title="Page not found" />;

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="font-heading text-3xl font-bold text-text-primary">{data.title}</h1>
      <div
        className="prose prose-invert mt-8 max-w-none text-text-secondary"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />
    </div>
  );
}
