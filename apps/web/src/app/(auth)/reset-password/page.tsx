'use client';

import Link from 'next/link';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { resetPasswordSchema } from '@amg/shared';
import { AuthLayout } from '@/components/layouts';
import { AuthForm } from '@/components/forms/AuthForm';
import { api } from '@/lib/api';

type ResetPasswordValues = {
  token: string;
  password: string;
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resolvedSearchParams?.token ?? '',
      password: '',
    },
  });

  return (
    <AuthLayout
      title="Choose a new password"
      description="Use the secure link from your email to set a new AMG Academy password."
    >
      <AuthForm
        form={form}
        fields={[
          { name: 'token', label: 'Reset token' },
          {
            name: 'password',
            label: 'New password',
            type: 'password',
            autoComplete: 'new-password',
          },
        ]}
        submitLabel="Reset password"
        isSubmitting={form.formState.isSubmitting}
        onSubmit={async (values) => {
          await api.post('/auth/reset-password', values);
          toast.success('Password reset complete. You can sign in now.');
          window.location.href = '/login';
        }}
        footer={
          <Link href="/login" className="text-brand-secondary hover:text-text-primary">
            Back to sign in
          </Link>
        }
      />
    </AuthLayout>
  );
}
