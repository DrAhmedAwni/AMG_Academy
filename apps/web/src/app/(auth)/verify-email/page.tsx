'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthLayout } from '@/components/layouts';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';

type VerificationState = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { token?: string; email?: string; sent?: string };
}) {
  const token = searchParams?.token;
  const email = searchParams?.email;
  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'idle');
  const [message, setMessage] = useState(
    token
      ? 'We are verifying your account now.'
      : email
        ? `A verification email was sent to ${email}.`
        : 'Open the email verification link we sent to complete your sign-up.',
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    void api
      .post('/auth/verify-email', { token })
      .then(() => {
        if (!active) {
          return;
        }
        setState('success');
        setMessage('Your email is verified. You can sign in now.');
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setState('error');
        setMessage('That verification link is invalid or expired.');
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthLayout
      title="Verify your email"
      description="Email verification keeps your AMG Academy account secure and ready for sign-in."
    >
      <Card className="bg-surface-elevated">
        <p className="text-sm leading-6 text-text-secondary">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-action px-4 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            {state === 'success' ? 'Continue to sign in' : 'Open sign in'}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-main hover:text-text-primary"
          >
            Back to registration
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
