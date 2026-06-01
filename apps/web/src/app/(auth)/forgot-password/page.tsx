'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { forgotPasswordSchema } from '@amg/shared';
import { AuthLayout } from '@/components/layouts';
import { AuthForm } from '@/components/forms/AuthForm';
import { api } from '@/lib/api';

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <AuthLayout
      title="Reset your password"
      description="We’ll send a secure reset link if the email matches an AMG Academy account."
    >
      <AuthForm
        form={form}
        fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email' }]}
        submitLabel="Send reset link"
        isSubmitting={form.formState.isSubmitting}
        onSubmit={async (values) => {
          await api.post('/auth/forgot-password', values);
          toast.success('If that email exists, a reset link has been sent.');
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
