import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account Deletion | AMG Academy',
  description: 'How AMG Academy users can request deletion of their account and associated app data.',
};

const supportEmail = 'support@amg.bdigital-dental.site';

export default function AccountDeletionPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand-secondary hover:text-text-primary">
          AMG Academy
        </Link>

        <header className="mt-8 border-b border-surface-border pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Allam Medical Group
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-text-primary">
            Account deletion request
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            AMG Academy users can request deletion of their account and associated app data by
            contacting Allam Medical Group (AMG).
          </p>
        </header>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            How to request account deletion
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            Send an email to{' '}
            <a className="font-semibold text-brand-secondary" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>{' '}
            with the subject line "Delete my AMG Academy account".
          </p>
          <p className="text-base leading-7 text-text-secondary">
            Please include the email address used for your AMG Academy account, your full name, and
            a clear request to delete your account. We may ask you to verify ownership of the
            account before completing the request.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Data that may be deleted
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            After verification, we will delete or anonymize account profile data, authentication
            data, notification preferences, and app-related personal data where deletion is legally
            and operationally permitted.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Data that may be retained
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            Some records may be retained where required for legal, payment, tax, security, fraud
            prevention, certificate verification, attendance records, audit logs, dispute handling,
            or regulatory obligations. Retained data is kept only for as long as necessary for
            those purposes.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Processing time
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            We aim to review deletion requests within 30 days after receiving the request and any
            required verification information.
          </p>
        </section>
      </div>
    </main>
  );
}
