import { cn } from '@/lib/utils';

export function LoadingSkeleton({
  lines = 3,
  variant = 'card',
  className,
}: {
  lines?: number;
  variant?: 'card' | 'table' | 'text';
  className?: string;
}) {
  const variants = {
    card: 'h-24 rounded-xl',
    table: 'h-12 rounded-lg',
    text: 'h-4 rounded-md',
  };

  return (
    <div className={cn('grid gap-4', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-gradient-to-r from-surface-elevated/60 via-surface-strong/30 to-surface-elevated/60',
            variants[variant],
          )}
        />
      ))}
    </div>
  );
}
