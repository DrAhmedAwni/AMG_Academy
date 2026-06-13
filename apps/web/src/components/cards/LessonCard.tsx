'use client';

import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    orderIndex: number;
    isCompleted?: boolean;
  };
  onClick?: () => void;
  isActive?: boolean;
}

export function LessonCard({ lesson, onClick, isActive }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
        isActive
          ? 'border-gold/30 bg-gold/5 shadow-glow-sm'
          : 'border-surface-border bg-surface-card/80 hover:border-gold/15 hover:bg-surface-card',
      )}
    >
      <div className="mt-0.5 shrink-0">
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-text-muted/30" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isActive ? 'text-gold-light' : 'text-text-primary',
            )}
          >
            {lesson.orderIndex}. {lesson.title}
          </span>
          {lesson.isCompleted && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              Done
            </span>
          )}
        </div>
        {lesson.description && (
          <span className="line-clamp-1 text-xs text-text-secondary">
            {lesson.description}
          </span>
        )}
        <span className="text-xs text-text-muted">{lesson.duration} min</span>
      </div>
      <div className="shrink-0 self-center">
        <PlayCircle
          className={cn(
            'h-5 w-5',
            isActive ? 'text-gold' : 'text-text-muted/40',
          )}
        />
      </div>
    </button>
  );
}
