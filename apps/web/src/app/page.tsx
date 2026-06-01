import Link from 'next/link';
import { Card } from '@/components/ui';

const highlights = [
  {
    title: 'Event registration',
    copy: 'Free and paid event workflows with approval-ready attendee records.',
  },
  {
    title: 'QR attendance',
    copy: 'Scanner-friendly check-in with secure tickets and live attendance control.',
  },
  {
    title: 'Protected courses',
    copy: 'Recorded learning paths with gated access and progress-aware delivery.',
  },
  {
    title: 'Admin operations',
    copy: 'One operating surface for staff, instructors, and future reporting flows.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-main text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-secondary">
          AMG Academy Platform V1
        </p>
        <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-tight md:text-7xl">
          Dental education operations, ready for launch.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
          A premium web workspace for AMG Academy members, students, event attendees, and
          operations staff.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-action px-4 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-surface-elevated px-4 text-sm font-medium text-text-primary transition hover:bg-surface-border"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
          >
            Open dashboard
          </Link>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.title} className="flex h-full flex-col justify-between bg-surface p-5">
              <div>
                <h2 className="font-heading text-xl font-semibold text-text-primary">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{item.copy}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
