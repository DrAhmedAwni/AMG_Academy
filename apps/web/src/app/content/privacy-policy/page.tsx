import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | AMG Academy',
  description: 'Privacy policy for the AMG Academy mobile and web app.',
};

const supportEmail = 'support@amg.bdigital-dental.site';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            This Privacy Policy explains how AMG Academy, under Allam Medical Group (AMG),
            collects, uses, and protects information when you use the AMG Academy app and website.
          </p>
          <p className="mt-3 text-sm text-text-muted">Last updated: June 9, 2026</p>
        </header>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Information we collect
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            We may collect account information such as your name, email address, phone number,
            specialty, clinic, city, profile details, login information, course activity, event
            registrations, certificates, payment status, support requests, notification settings,
            and community or case discussion content that you choose to submit.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            How we use information
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            We use information to create and manage accounts, provide access to courses and
            lessons, process event registrations, issue tickets and certificates, send important
            updates, support community features, improve app reliability, prevent misuse, and
            respond to support or account requests.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Sharing and service providers
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            We do not sell personal information. We may share limited information with service
            providers that help us operate AMG Academy, such as hosting, authentication, analytics,
            payment processing, email, notifications, storage, security, and customer support
            services. We may also disclose information when required by law or to protect users,
            AMG Academy, or Allam Medical Group.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Security
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            We use reasonable technical and organizational safeguards to protect user information,
            including encrypted transport where supported. No online service can guarantee complete
            security, but we work to protect account and app data from unauthorized access.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Account deletion
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            You can request deletion of your AMG Academy account and associated app data from our{' '}
            <Link href="/content/account-deletion" className="font-semibold text-brand-secondary">
              account deletion page
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Contact
          </h2>
          <p className="text-base leading-7 text-text-secondary">
            For privacy questions or requests, contact us at{' '}
            <a className="font-semibold text-brand-secondary" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
