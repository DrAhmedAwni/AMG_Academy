import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  GraduationCap,
  QrCode,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const navItems = ['Courses', 'Events', 'Attendance', 'Communication'];

const operations = [
  {
    title: 'Event registration',
    copy: 'Free and paid event workflows with approval-ready attendee records.',
    icon: CalendarDays,
  },
  {
    title: 'QR attendance',
    copy: 'Scanner-friendly check-in with secure tickets and live control.',
    icon: QrCode,
  },
  {
    title: 'Protected courses',
    copy: 'Recorded learning paths with gated access and progress-aware delivery.',
    icon: GraduationCap,
  },
  {
    title: 'Mobile alerts',
    copy: 'Announcement and course updates through native push notifications.',
    icon: BellRing,
  },
];

const footerLinks = [
  { label: 'Privacy Policy', href: '/content/privacy-policy' },
  { label: 'Terms of Service', href: '/content/terms-of-service' },
  { label: 'Support', href: '/content/support' },
  { label: 'Contact Us', href: '/content/support' },
];

const campusImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_y51UQ5-WkIrc5M4T5u1M-7QjNgdR0yv89wGaHyAWuGzq2z2KdxZ7cDWeqxr44iUEqnxBbFfSQW3RBXJ7TN0BtxgyS4Wk6NtKxCTmiqAFIr5hc9_-jSt5xDmGWiYrpKeOEw1Xui1e5tsszBWCR96PqvrvXAHy_Lrq0rkFVZCS90_L8gxt6DHIbnneDr6SeDeY4V9PN-JuT25MOyzDpmCXgP7hoDU3V8h2iSDx0NodveeHRFUmhGQR2R5O_yi9M_PD8t19pMpfHhc';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-main text-text-primary">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-main/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link href="/" className="shrink-0 font-heading text-lg font-extrabold uppercase text-text-primary">
            AMG ACADEMY
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item}
                href={index === 0 ? '/courses' : '#'}
                className={
                  index === 0
                    ? 'border-b-2 border-gold pb-1 text-xs font-semibold text-gold-light'
                    : 'text-xs font-semibold text-text-secondary transition hover:text-text-primary'
                }
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl px-3 text-xs font-semibold text-text-secondary transition hover:bg-white/5 sm:px-5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gold/30 bg-gold px-4 text-xs font-bold text-surface-main shadow-glow-sm transition hover:bg-gold-light sm:px-6"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="max-w-3xl font-heading text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-[1.08] text-text-primary sm:text-[56px]">
              <span className="block">Dental education</span>
              <span className="block">that feels ready for</span>
              <span className="block text-gold">launch.</span>
            </h1>

            <p className="mt-10 max-w-2xl text-lg leading-8 text-text-secondary">
              AMG Academy brings registration, protected courses, attendance, and member
              communication into one premium web and mobile experience.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-[54px] items-center justify-center gap-3 rounded-xl bg-gold px-8 text-xl font-semibold text-surface-main shadow-glow transition hover:bg-gold-light sm:w-auto"
              >
                Create account
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-[54px] items-center justify-center rounded-xl border border-surface-border px-8 text-xl font-semibold text-text-primary transition hover:border-gold/40 hover:bg-white/5 sm:w-auto"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card gold-ring sm:p-6 lg:col-span-6">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-xl font-black text-gold">
                  A
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold leading-none text-text-primary">
                    AMG Academy
                  </h2>
                  <p className="mt-2 text-xs font-medium text-text-secondary">Live operations overview</p>
                </div>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-gold-light">
                <span className="h-2 w-2 rounded-full bg-gold" />
                <span className="text-[10px] font-bold uppercase">Online</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="min-h-[180px] rounded-xl border border-surface-border bg-surface-elevated/60 p-6 transition hover:border-gold/25 hover:bg-surface-elevated"
                  >
                    <Icon className="h-6 w-6 text-gold" />
                    <h3 className="mt-5 text-base font-extrabold text-text-primary">{item.title}</h3>
                    <p className="mt-3 text-xs font-medium leading-6 text-text-secondary">{item.copy}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="mt-28 grid items-start gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-surface-border bg-surface-card p-6 gold-ring lg:p-8">
            <h2 className="font-heading text-4xl font-extrabold text-text-primary">
              Elite Digital Campus
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Access your curriculum from anywhere with zero latency and high-fidelity video
              delivery optimized for medical education.
            </p>
            <div className="relative mt-10 aspect-[2.4/1] overflow-hidden rounded-xl border border-surface-border bg-[#0a0a0a]">
              <img
                src={campusImage}
                alt="Digital dental education monitors in a clinical learning environment"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-main via-surface-main/20 to-transparent" />
            </div>
          </article>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-surface-border bg-surface-card p-8 transition hover:border-gold/25 gold-ring">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-gold">
                  <UsersRound className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-text-primary">Community</h2>
                <p className="mt-4 text-lg leading-7 text-text-secondary">
                  Connect with thousands of elite professionals in private, moderated forums.
                </p>
              </article>

              <article className="rounded-2xl border border-surface-border bg-surface-card p-8 transition hover:border-gold/25 gold-ring">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-surface-border bg-surface-elevated text-gold">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-text-primary">Analytics</h2>
                <p className="mt-4 text-lg leading-7 text-text-secondary">
                  Deep insights into learning progress and course completion metrics.
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-surface-border bg-gradient-to-br from-surface-elevated to-surface-card p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-text-primary">Mobile Native App</h2>
                  <p className="mt-2 max-w-md text-base leading-7 text-text-secondary">
                    Available on iOS & Android for learning on the go.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex h-[52px] items-center rounded-lg border border-surface-border bg-white/5 px-4 text-[10px] font-bold uppercase text-text-secondary">
                    App Store
                  </span>
                  <span className="inline-flex h-[52px] items-center rounded-lg border border-surface-border bg-white/5 px-4 text-[10px] font-bold uppercase text-text-secondary">
                    Play Store
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <footer className="border-t border-surface-border bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="text-2xl font-extrabold text-gold">AMG ACADEMY</p>
            <p className="mt-3 text-base text-text-secondary">
              &copy; 2024 AMG Academy, Premium Professional Education.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="text-xs font-medium text-text-muted transition hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
