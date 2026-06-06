import Link from 'next/link';
import { ArrowRight, Bell, CalendarCheck, GraduationCap, QrCode, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';

const highlights = [
  {
    title: 'Event registration',
    copy: 'Free and paid event workflows with approval-ready attendee records.',
    icon: CalendarCheck,
  },
  {
    title: 'QR attendance',
    copy: 'Scanner-friendly check-in with secure tickets and live attendance control.',
    icon: QrCode,
  },
  {
    title: 'Protected courses',
    copy: 'Recorded learning paths with gated access and progress-aware delivery.',
    icon: GraduationCap,
  },
  {
    title: 'Mobile alerts',
    copy: 'Announcement and course updates can reach members through native push notifications.',
    icon: Bell,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-main text-text-primary">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo className="h-12 w-12" />
            <span className="hidden font-heading text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary sm:block">
              AMG Academy
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-surface-border/70 bg-surface-elevated/70 px-4 text-sm font-semibold text-text-primary transition hover:border-cyan/40"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-cyan/50 bg-cyan px-4 text-sm font-bold text-surface-main shadow-glow-sm transition hover:bg-cyan-light"
            >
              Create account
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-8">
          <div>
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-surface-border/80 bg-surface-card/80 px-3 py-2 text-xs font-semibold text-text-secondary">
              <ShieldCheck className="h-4 w-4 text-cyan" />
              Secure academy workspace
            </div>
            <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-normal text-text-primary sm:text-6xl lg:text-7xl">
              Dental education that feels ready for launch.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
              AMG Academy brings registration, protected courses, attendance, and member
              communication into one premium web and mobile experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan/50 bg-cyan px-5 text-sm font-bold text-surface-main shadow-glow transition hover:bg-cyan-light"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-surface-border/70 bg-surface-elevated/80 px-5 text-sm font-semibold text-text-primary transition hover:border-cyan/40"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-surface-border/80 bg-surface-card/90 shadow-elevated">
              <div className="border-b border-surface-border/70 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BrandLogo className="h-16 w-16" decorative />
                    <div>
                      <p className="font-heading text-lg font-semibold">AMG Academy</p>
                      <p className="text-sm text-text-secondary">Live operations overview</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
                    Online
                  </span>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="min-h-40 rounded-xl border border-surface-border/70 bg-surface-elevated/70 p-5"
                    >
                      <Icon className="h-6 w-6 text-cyan" />
                      <h2 className="mt-5 font-heading text-lg font-semibold text-text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">{item.copy}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
