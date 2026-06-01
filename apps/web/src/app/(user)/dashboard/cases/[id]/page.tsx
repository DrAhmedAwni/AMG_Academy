'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  ChevronUp,
  Image as ImageIcon,
  MessageSquare,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

interface CaseImage {
  id: string;
  storageKey: string;
  caption: string | null;
  orderIndex: number;
}

interface CaseComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  parentCommentId: string | null;
  replyCount: number;
}

interface CaseDetail {
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
  images: CaseImage[];
  comments: CaseComment[];
}

function getImageUrl(storageKey: string) {
  return `/api/v1/cases/images/${encodeURIComponent(storageKey)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const caseId = params.id;
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');

  const caseQuery = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const { data } = await api.get(`/cases/${encodeURIComponent(caseId)}`);
      return (data?.data ?? data) as CaseDetail;
    },
    enabled: Boolean(caseId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['case', caseId] });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/cases/${encodeURIComponent(caseId)}/upvote`);
    },
    onSuccess: () => invalidate(),
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to upvote'),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/cases/${encodeURIComponent(caseId)}/bookmark`);
    },
    onSuccess: () => invalidate(),
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to bookmark'),
  });

  const commentMutation = useMutation({
    mutationFn: async (body: string) => {
      await api.post(`/cases/${encodeURIComponent(caseId)}/comments`, { body });
    },
    onSuccess: () => {
      toast.success('Comment posted');
      setCommentBody('');
      invalidate();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.error?.message ?? 'Failed to post comment'),
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    commentMutation.mutate(trimmed);
  };

  if (caseQuery.isLoading) {
    return <LoadingSkeleton lines={8} variant="card" />;
  }

  if (caseQuery.isError) {
    const status = (caseQuery.error as any)?.response?.status;
    if (status === 404) {
      return (
        <EmptyState
          title="Case not found"
          description="This case does not exist or has been removed."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load case"
        description={(caseQuery.error as any)?.message ?? 'Something went wrong'}
        onRetry={caseQuery.refetch}
      />
    );
  }

  const c = caseQuery.data;

  if (!c) {
    return (
      <EmptyState
        title="Case not found"
        description="This case does not exist or has been removed."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back to Cases
      </Button>

      <PageHeader
        title={c.title}
        description={`By ${c.authorName} \u00b7 ${formatDate(c.createdAt)} \u00b7 ${c.categoryName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={c.isUpvoted ? 'primary' : 'secondary'}
              onClick={() => upvoteMutation.mutate()}
              disabled={upvoteMutation.isPending}
            >
              <ChevronUp className="h-4 w-4" />
              {c.upvoteCount}
            </Button>
            <Button
              size="sm"
              variant={c.isBookmarked ? 'primary' : 'secondary'}
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
            >
              <Bookmark className="h-4 w-4" />
              {c.isBookmarked ? 'Saved' : 'Save'}
            </Button>
          </div>
        }
      />

      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {c.description}
        </p>

        {c.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {c.tags.map((tag) => (
              <Badge key={tag} variant="muted" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card>

      {c.images.length > 0 ? (
        <Card>
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Images
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.images
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-xl border border-surface-border bg-surface-elevated"
                >
                  <img
                    src={getImageUrl(img.storageKey)}
                    alt={img.caption ?? 'Case image'}
                    className="h-48 w-full object-cover"
                  />
                  {img.caption ? (
                    <p className="px-3 py-2 text-xs text-text-muted">{img.caption}</p>
                  ) : null}
                </div>
              ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="font-heading text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {c.commentCount > 0 ? (
            <span className="text-sm font-normal text-text-muted">({c.commentCount})</span>
          ) : null}
        </h2>

        <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-3">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Share your thoughts on this case..."
            rows={3}
            className="h-24 w-full rounded-xl border bg-surface-card/90 px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted/60 border-surface-border/70 focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20 transition-all duration-200 resize-none"
          />
          <Button
            type="submit"
            size="sm"
            loading={commentMutation.isPending}
            disabled={!commentBody.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4" />
            Post
          </Button>
        </form>

        {c.comments.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <div className="space-y-4">
            {c.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-surface-border/50 bg-surface-elevated/40 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
