import { Card } from '@/components/ui';

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.25),_transparent_35%),linear-gradient(180deg,_#05070A_0%,_#10141B_100%)] px-6 py-12">
      <Card className="w-full max-w-lg bg-surface/95 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-secondary">
          AMG Academy
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
        <div className="mt-8">{children}</div>
      </Card>
    </main>
  );
}
