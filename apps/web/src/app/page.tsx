import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  GraduationCap,
  QrCode,
  ShieldCheck,
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

const footerLinks = ['Privacy Policy', 'Terms of Service', 'Support', 'Contact Us'];

const campusImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_y51UQ5-WkIrc5M4T5u1M-7QjNgdR0yv89wGaHyAWuGzq2z2KdxZ7cDWeqxr44iUEqnxBbFfSQW3RBXJ7TN0BtxgyS4Wk6NtKxCTmiqAFIr5hc9_-jSt5xDmGWiYrpKeOEw1Xui1e5tsszBWCR96PqvrvXAHy_Lrq0rkFVZCS90_L8gxt6DHIbnneDr6SeDeY4V9PN-JuT25MOyzDpmCXgP7hoDU3V8h2iSDx0NodveeHRFUmhGQR2R5O_yi9M_PD8t19pMpfHhc';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#051424] text-[#d4e4fa]">
      <header className="sticky top-0 z-30 border-b border-[#3c4949]/40 bg-[#051424]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <Link href="/" className="shrink-0 font-heading text-lg font-extrabold uppercase text-[#e7f2ff]">
            AMG ACADEMY
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item}
                href={index === 0 ? '/courses' : '#'}
                className={
                  index === 0
                    ? 'border-b-2 border-[#5ce1e6] pb-1 text-xs font-semibold text-[#95fbff]'
                    : 'text-xs font-semibold text-[#bbc9c9] transition hover:text-[#d4e4fa]'
                }
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold text-[#d4e4fa] transition hover:bg-white/5 sm:px-5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#95fbff]/30 bg-[#5ce1e6] px-4 text-xs font-bold text-[#003738] shadow-[0_0_22px_rgba(92,225,230,0.22)] transition hover:bg-[#95fbff] sm:px-6"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#3c4949]/70 bg-[#1c2b3c] px-4 py-2 text-[#95fbff]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase">Secure academy workspace</span>
            </div>

            <h1 className="max-w-3xl font-heading text-5xl font-extrabold leading-[1.08] text-[#dbeafe] sm:text-[56px]">
              <span className="block">Dental education</span>
              <span className="block">that feels ready for</span>
              <span className="block text-[#5ce1e6]">launch.</span>
            </h1>

            <p className="mt-10 max-w-2xl text-lg leading-8 text-[#d7e1eb]">
              AMG Academy brings registration, protected courses, attendance, and member
              communication into one premium web and mobile experience.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-[70px] items-center justify-center gap-3 rounded-xl bg-[#5ce1e6] px-8 text-xl font-semibold text-[#003738] shadow-[0_16px_35px_rgba(92,225,230,0.18)] transition hover:bg-[#95fbff] sm:w-auto"
              >
                Create account
                <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-[70px] items-center justify-center rounded-xl border border-[#869394]/45 px-8 text-xl font-semibold text-[#d4e4fa] transition hover:border-[#5ce1e6]/60 hover:bg-white/5 sm:w-auto"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-[#122131]/80 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] lg:col-span-6 sm:p-6">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#3c4949]/70 bg-[#273647] text-xl font-black italic text-[#95fbff]">
                  A
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold leading-none text-[#d4e4fa]">
                    AMG Academy
                  </h2>
                  <p className="mt-2 text-xs font-medium text-[#bbc9c9]">Live operations overview</p>
                </div>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#95fbff]/25 bg-[#95fbff]/10 px-4 py-2 text-[#95fbff]">
                <span className="h-2 w-2 rounded-full bg-[#95fbff]" />
                <span className="text-[10px] font-bold uppercase">Online</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {operations.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="min-h-[180px] rounded-xl border border-white/10 bg-[#0d1c2d]/80 p-6 transition hover:border-[#5ce1e6]/40 hover:bg-[#102236]"
                  >
                    <Icon className="h-6 w-6 text-[#95fbff]" />
                    <h3 className="mt-5 text-base font-extrabold text-[#e7eaf3]">{item.title}</h3>
                    <p className="mt-3 text-xs font-medium leading-6 text-[#d7e1eb]">{item.copy}</p>
                  </article>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="mt-28 grid items-start gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#122131]/80 p-6 lg:p-8">
            <h2 className="font-heading text-4xl font-extrabold text-[#dbeafe]">
              Elite Digital Campus
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d7e1eb] sm:text-lg">
              Access your curriculum from anywhere with zero latency and high-fidelity video
              delivery optimized for medical education.
            </p>
            <div className="relative mt-10 aspect-[2.4/1] overflow-hidden rounded-xl border border-white/10 bg-[#010f1f]">
              <img
                src={campusImage}
                alt="Digital dental education monitors in a clinical learning environment"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/20 to-transparent" />
            </div>
          </article>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-[#122131]/80 p-8 transition hover:border-[#5ce1e6]/40">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-[#3c4949]/70 bg-[#273647]/70 text-[#95fbff]">
                  <UsersRound className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#e7eaf3]">Community</h2>
                <p className="mt-4 text-lg leading-7 text-[#d7e1eb]">
                  Connect with thousands of elite professionals in private, moderated forums.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-[#122131]/80 p-8 transition hover:border-[#5ce1e6]/40">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-[#3c4949]/70 bg-[#273647]/70 text-[#95fbff]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#e7eaf3]">Analytics</h2>
                <p className="mt-4 text-lg leading-7 text-[#d7e1eb]">
                  Deep insights into learning progress and course completion metrics.
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1c2b3c] to-[#0d1c2d] p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#e7eaf3]">Mobile Native App</h2>
                  <p className="mt-2 max-w-md text-base leading-7 text-[#d7e1eb]">
                    Available on iOS & Android for learning on the go.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex h-[52px] items-center rounded-lg border border-white/10 bg-white/5 px-4 text-[10px] font-bold uppercase text-[#d4e4fa]">
                    App Store
                  </span>
                  <span className="inline-flex h-[52px] items-center rounded-lg border border-white/10 bg-white/5 px-4 text-[10px] font-bold uppercase text-[#d4e4fa]">
                    Play Store
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#3c4949]/35 bg-[#010f1f]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="text-2xl font-extrabold text-[#95fbff]">AMG ACADEMY</p>
            <p className="mt-3 text-base text-[#bbc9c9]">
              © 2024 AMG Academy, Elite Professional Education.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((item) => (
              <Link
                href="#"
                key={item}
                className="text-xs font-medium text-[#869394] transition hover:text-[#95fbff]"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
