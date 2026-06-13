'use client';

import { useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/tables/DataTable';
import { Button, Input, Modal, Card } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ArrowLeft, BookOpen, Link2, Upload, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface LessonVideo {
  id: string;
  duration: number;
  originalName: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  orderIndex: number;
  videoId: string | null;
  video?: LessonVideo | null;
}

interface CourseOption {
  id: string;
  title: string;
}

type LessonFormState = {
  title: string;
  description: string;
  courseId: string;
  orderIndex: number;
  duration: number;
  videoId: string;
};

type VideoUploadResponse = {
  id?: string;
  originalName?: string | null;
};

function toControlledString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toControlledNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

async function fetchLessons(courseId: string) {
  const res = await api.get('/lessons', { params: { courseId } });
  const payload = res.data?.data ?? res.data;
  return (Array.isArray(payload) ? payload : payload?.data ?? []) as Lesson[];
}

async function fetchCourses() {
  const res = await api.get('/courses/admin', { params: { page: 1, limit: 100 } });
  const payload = res.data?.data ?? res.data;
  return (Array.isArray(payload) ? payload : payload?.data ?? []) as CourseOption[];
}

async function createLesson(body: Record<string, unknown>) {
  const res = await api.post('/lessons', body);
  return res.data;
}

async function updateLesson(id: string, body: Record<string, unknown>) {
  const res = await api.patch(`/lessons/${id}`, body);
  return res.data;
}

async function deleteLesson(id: string) {
  const res = await api.delete(`/lessons/${id}`);
  return res.data;
}

export default function AdminLessonsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId') ?? '';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const queryClient = useQueryClient();

  const { data: lessons, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-lessons', courseId],
    queryFn: () => fetchLessons(courseId),
    enabled: !!courseId,
  });

  const coursesQuery = useQuery({
    queryKey: ['admin-courses-list-for-lessons'],
    queryFn: fetchCourses,
  });

  const selectedCourse = coursesQuery.data?.find((c) => c.id === courseId);

  const createMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      toast.success('Lesson created');
      setShowCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => updateLesson(id, body),
    onSuccess: () => {
      toast.success('Lesson updated');
      setEditingLesson(null);
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      toast.success('Lesson deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Failed to delete'),
  });

  const handleCourseChange = useCallback((id: string) => {
    router.push(`/admin/lessons?courseId=${id}`);
  }, [router]);

  if (!courseId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Lessons</h1>
        </div>

        {coursesQuery.isLoading ? (
          <LoadingSkeleton lines={4} />
        ) : coursesQuery.isError ? (
          <ErrorState title="Failed to load courses" description="Could not fetch course list." onRetry={() => coursesQuery.refetch()} />
        ) : coursesQuery.data && coursesQuery.data.length > 0 ? (
          <Card>
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Select a course</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {coursesQuery.data.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleCourseChange(course.id)}
                  className="flex items-center gap-3 rounded-xl border border-surface-border/60 bg-surface-card/70 p-4 text-left transition-all hover:border-gold/40 hover:bg-surface-card"
                >
                  <BookOpen className="h-5 w-5 shrink-0 text-gold" />
                  <span className="font-medium text-text-primary">{course.title}</span>
                </button>
              ))}
            </div>
          </Card>
        ) : (
          <>
            <EmptyState
              title="No courses yet"
              description="Create a course first, then add lessons to it."
            />
            <div className="flex justify-center">
              <Link href="/admin/courses">
                <Button>Go to Courses</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load lessons" description={error?.message ?? ''} onRetry={refetch} />;

  const columns = [
    { id: 'orderIndex', header: '#', cell: (l: Lesson) => l.orderIndex },
    { id: 'title', header: 'Title', cell: (l: Lesson) => l.title },
    { id: 'duration', header: 'Duration', cell: (l: Lesson) => `${l.duration} min` },
    { id: 'video', header: 'Video', cell: (l: Lesson) => (l.video ? l.video.originalName : l.videoId ? 'Yes' : 'No') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/lessons">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Lessons</h1>
          {selectedCourse && (
            <p className="text-sm text-text-muted">Course: {selectedCourse.title}</p>
          )}
        </div>
        <select
          value={courseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="h-10 rounded-xl border border-surface-border/70 bg-surface-card/90 px-3 text-sm text-text-primary outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
        >
          {coursesQuery.data?.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={lessons ?? []}
        rowKey={(lesson) => lesson.id}
        rowActions={(lesson: Lesson) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingLesson(lesson)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(lesson.id)}>
              <Trash2 className="h-4 w-4 text-status-error" />
            </Button>
          </div>
        )}
      />

      {showCreateModal && (
        <LessonFormModal
          title="Add Lesson"
          courseId={courseId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(body) => createMutation.mutate(body)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingLesson && (
        <LessonFormModal
          title="Edit Lesson"
          courseId={courseId}
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSubmit={(body) => updateMutation.mutate({ id: editingLesson.id, body })}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function extractGoogleDriveFileId(url: string): string | null {
  const fileMatch = url.match(/\/file\/d\/([^/]+)\//);
  if (fileMatch?.[1]) return fileMatch[1];
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch?.[1]) return idMatch[1];
  return null;
}

function LessonFormModal({
  title,
  courseId,
  lesson,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  courseId: string;
  lesson?: Lesson;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<LessonFormState>({
    title: toControlledString(lesson?.title),
    description: toControlledString(lesson?.description),
    courseId,
    orderIndex: toControlledNumber(lesson?.orderIndex, 1),
    duration: toControlledNumber(lesson?.duration, 0),
    videoId: toControlledString(lesson?.videoId),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [videoSource, setVideoSource] = useState<'url' | 'upload'>('url');
  const [driveUrl, setDriveUrl] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoName, setVideoName] = useState<string | null>(lesson?.video?.originalName ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachedVideoId = form.videoId;
  const hasVideo = !!attachedVideoId;

  const clearError = (field: string) => setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  const handleAttachDriveUrl = async () => {
    if (!driveUrl.trim()) return;
    setAttaching(true);
    try {
      const res = await api.post('/videos/from-url', { url: driveUrl.trim() });
      const video = res.data.data as VideoUploadResponse;
      if (!video.id) {
        throw new Error('Video response did not include an id');
      }
      setForm((prev) => ({ ...prev, videoId: video.id ?? '' }));
      setVideoName(video.originalName ?? 'Google Drive video');
      setDriveUrl('');
      toast.success('Video attached from Google Drive');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to attach video');
    } finally {
      setAttaching(false);
    }
  };

  const handleUploadVideo = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('video', uploadFile);
      const res = await api.post('/videos/upload', fd, {
        timeout: 300000,
      });
      const video = res.data.data as VideoUploadResponse;
      if (!video.id) {
        throw new Error('Video response did not include an id');
      }
      setForm((prev) => ({ ...prev, videoId: video.id ?? '' }));
      setVideoName(video.originalName ?? uploadFile.name);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Video uploaded and attached');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setForm((prev) => ({ ...prev, videoId: '' }));
    setVideoName(null);
    setDriveUrl('');
    setUploadFile(null);
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (form.title.trim().length < 2) errors.title = 'Title must be at least 2 characters';
    if (form.orderIndex < 1) errors.orderIndex = 'Order index must be at least 1';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit({
      ...form,
      videoId: form.videoId || null,
    });
  };

  return (
    <Modal open title={title} onClose={onClose} maxWidth="md">
      <div className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          error={fieldErrors.title}
          onChange={(e) => { setForm({ ...form, title: e.target.value }); clearError('title'); }}
          required
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Description</span>
          <textarea
            className="w-full rounded-xl border border-surface-border/70 bg-surface-card/90 px-3 py-2 text-sm text-text-primary outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => { setForm({ ...form, description: e.target.value }); clearError('description'); }}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Order Index"
            type="number"
            min={1}
            value={form.orderIndex}
            error={fieldErrors.orderIndex}
            onChange={(e) => { setForm({ ...form, orderIndex: toControlledNumber(Number(e.target.value), 1) }); clearError('orderIndex'); }}
            required
          />
          <Input
            label="Duration (minutes)"
            type="number"
            min={0}
            value={form.duration}
            onChange={(e) => { setForm({ ...form, duration: toControlledNumber(Number(e.target.value), 0) }); clearError('duration'); }}
          />
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-text-secondary">Lesson Video</span>

          {hasVideo && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{videoName ?? 'Video attached'}</span>
              <button type="button" onClick={handleRemoveVideo} className="shrink-0 text-text-muted hover:text-status-error">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex gap-1 rounded-xl border border-surface-border/70 bg-surface-elevated/50 p-1">
            <button
              type="button"
              onClick={() => setVideoSource('url')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                videoSource === 'url' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Link2 className="h-4 w-4" />
              Google Drive Link
            </button>
            <button
              type="button"
              onClick={() => setVideoSource('upload')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                videoSource === 'upload' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload Video
            </button>
          </div>

          {videoSource === 'url' ? (
            <div key="drive-url-source" className="flex gap-2">
              <input
                type="text"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 rounded-xl border border-surface-border/70 bg-surface-card/90 px-3 py-2 text-sm text-text-primary outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
              />
              <Button size="sm" onClick={handleAttachDriveUrl} disabled={attaching || !driveUrl.trim()}>
                {attaching ? 'Attaching...' : 'Attach'}
              </Button>
            </div>
          ) : (
            <div key="video-upload-source" className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-text-primary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gold hover:file:bg-gold/20"
              />
              <p className="text-xs text-text-muted">MP4, WebM, MOV up to 500MB</p>
              {uploadFile && (
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate text-sm text-text-primary">{uploadFile.name}</span>
                  <Button size="sm" onClick={handleUploadVideo} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload & Attach'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
