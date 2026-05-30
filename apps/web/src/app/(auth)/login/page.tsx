'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@amg/shared';
import { AuthLayout } from '@/components/layouts';
import { AuthForm } from '@/components/forms/AuthForm';
import { useAuth } from '@/hooks/useAuth';

type LoginFormValues = {
  email: string;
  password: string;
};

type AuthApiError = {
  error?: {
    message?: string;
    details?: {
      verificationUrl?: string;
    };
  };
};

function getLoginError(error: unknown) {
  if (isAxiosError<AuthApiError>(error)) {
    return {
      message: error.response?.data?.error?.message ?? 'Sign in failed. Please try again.',
      verificationUrl: error.response?.data?.error?.details?.verificationUrl,
    };
  }

  return {
    message: 'Sign in failed. Please try again.',
    verificationUrl: undefined,
  };
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const { login, loginPending } = useAuth();
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const redirectTo = useMemo(() => searchParams?.redirect ?? null, [searchParams?.redirect]);

  return (
    <AuthLayout
      title="Sign in to AMG Academy"
      description="Access your dashboard, event registrations, and course workspace."
    >
      <AuthForm
        form={form}
        fields={[
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            autoComplete: 'current-password',
          },
        ]}
        submitLabel="Sign in"
        isSubmitting={loginPending}
        onSubmit={async (values) => {
          setVerificationUrl(null);
          form.clearErrors('root');

          try {
            await login({ values, redirectTo });
          } catch (error) {
            const loginError = getLoginError(error);
            setVerificationUrl(loginError.verificationUrl ?? null);
            form.setError('root', { message: loginError.message });
          }
        }}
        footer={
          <div className="space-y-3">
            {verificationUrl ? (
              <Link
                href={verificationUrl}
                className="block rounded-md border border-brand-action/40 bg-brand-action/10 px-3 py-2 text-brand-secondary hover:text-text-primary"
              >
                Verify this account
              </Link>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <Link href="/forgot-password" className="text-brand-secondary hover:text-text-primary">
                Forgot password?
              </Link>
              <span>
                New here?{' '}
                <Link href="/register" className="text-brand-secondary hover:text-text-primary">
                  Create account
                </Link>
              </span>
            </div>
          </div>
        }
      />
    </AuthLayout>
  );
}
