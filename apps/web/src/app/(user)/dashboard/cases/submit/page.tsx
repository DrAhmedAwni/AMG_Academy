'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { LoadingSkeleton, ErrorState } from '@/components/states';
import { api } from '@/lib/api';

interface CaseCategory {
  id: string;
  name: string;
}

interface FieldErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string;
}

export default function SubmitCasePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const categoriesQuery = useQuery({
    queryKey: ['case-categories'],
    queryFn: async () => {
      const { data } = await api.get('/case-categories');
      return data;
    },
  });

  const categories: CaseCategory[] = (() => {
    const payload = categoriesQuery.data;
    const list = payload?.data ?? payload ?? [];
    return Array.isArray(list) ? list : [];
  })();

  const submitMutation = useMutation({
    mutationFn: async () => {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const { data } = await api.post('/cases', {
        title,
        description,
        categoryId,
        tags: tagList,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Case submitted for review');
      router.push('/dashboard/cases');
    },
    onError: (error: any) => {
      const validationErrors = error?.response?.data?.error?.details;
      if (validationErrors) {
        const errors: FieldErrors = {};
        for (const detail of validationErrors) {
          if (detail.field) {
            (errors as any)[detail.field] = detail.message;
          }
        }
        setFieldErrors(errors);
      }
      toast.error(
        error?.response?.data?.error?.message ?? 'Failed to submit case',
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    submitMutation.mutate();
  };

  if (categoriesQuery.isLoading) return <LoadingSkeleton lines={4} variant="card" />;
  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Failed to load categories"
        description={(categoriesQuery.error as any)?.message ?? 'Something went wrong'}
        onRetry={categoriesQuery.refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <PageHeader
        title="Submit Case"
        accent="Forum"
        description="Share a clinical case with the AMG community. All submissions are reviewed before publication."
      />

      <Card className="border-warning/30 bg-warning/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-sm text-text-primary">
              De-identification Reminder
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Please ensure all patient information has been de-identified before
              submitting. Remove or blur any patient names, dates of birth, medical
              record numbers, facial photographs, or other identifying details.
              Submissions containing PHI will be rejected.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Complex endodontic retreatment of tooth #30"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={fieldErrors.title}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the case presentation, diagnosis, treatment plan, and outcome..."
              rows={8}
              required
              className="h-48 w-full rounded-xl border bg-surface-card/90 px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-muted/60 border-surface-border/70 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all duration-200 resize-none"
            />
            {fieldErrors.description ? (
              <span className="text-xs text-status-error">{fieldErrors.description}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="categoryId" className="text-sm font-medium text-text-secondary">
              Category
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="h-10 w-full rounded-xl border bg-surface-card/90 px-3 text-sm text-text-primary shadow-sm border-surface-border/70 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId ? (
              <span className="text-xs text-status-error">{fieldErrors.categoryId}</span>
            ) : null}
          </div>

          <Input
            label="Tags"
            placeholder="e.g. endo, molar, retreatment (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            error={fieldErrors.tags}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="gold"
              loading={submitMutation.isPending}
              disabled={submitMutation.isPending}
            >
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard/cases')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
