import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';

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
    <main className="min-h-screen overflow-hidden bg-surface-main text-text-primary">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden border-r border-surface-border/70 bg-[linear-gradient(160deg,#020617_0%,#071114_52%,#0f172a_100%)] px-10 py-8 lg:flex lg:flex-col">
          <Link href="/" className="flex w-fit items-center gap-3">
            <BrandLogo className="h-14 w-14" />
            <span className="font-heading text-sm font-semibold uppercase tracking-[0.28em] text-text-secondary">
              AMG Academy
            </span>
          </Link>
          <div className="flex flex-1 flex-col justify-center">
            <p className="max-w-sm font-heading text-4xl font-semibold leading-tight">
              A focused workspace for dental learning, events, and academy operations.
            </p>
            <div className="mt-10 grid gap-4">
              {['Course access', 'Event registration', 'Mobile notifications'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-cyan shadow-glow-sm" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-muted">AIM Medical Group digital learning platform</p>
        </section>
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-xl">
            <Link href="/" className="mb-8 flex w-fit items-center gap-3 lg:hidden">
              <BrandLogo className="h-12 w-12" />
              <span className="font-heading text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                AMG Academy
              </span>
            </Link>
            <div className="rounded-2xl border border-surface-border/80 bg-surface-card/88 p-6 shadow-elevated sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan">
                AMG Academy
              </p>
              <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">{description}</p>
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
