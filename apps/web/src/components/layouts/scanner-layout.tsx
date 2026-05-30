export function ScannerLayout({
  children,
  eventName,
}: {
  children: React.ReactNode;
  eventName?: string;
}) {
  return (
    <main className="min-h-screen bg-surface-main px-4 py-6 text-text-primary">
      <div className="mx-auto max-w-3xl">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-light">
            AMG Academy Scanner
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">
            {eventName ?? 'Event Check-in'}
          </h1>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
