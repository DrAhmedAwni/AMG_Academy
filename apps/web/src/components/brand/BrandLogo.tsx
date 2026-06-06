import { cn } from '@/lib/utils';

export function BrandLogo({
  className,
  alt = 'AMG Academy',
  decorative = false,
}: {
  className?: string;
  alt?: string;
  decorative?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black',
        className,
      )}
    >
      <img
        src="/brand/amg-logo.png"
        alt={decorative ? '' : alt}
        aria-hidden={decorative ? true : undefined}
        className="h-full w-full scale-[2.65] object-cover"
      />
    </span>
  );
}
