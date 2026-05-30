'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { registerSchema } from '@amg/shared';
import { AuthLayout } from '@/components/layouts';
import { AuthForm } from '@/components/forms/AuthForm';
import { api } from '@/lib/api';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type RegisterResponse = {
  verificationUrl?: string;
};

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialty?: string;
  clinic?: string;
  city?: string;
};

export default function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialty: '',
      clinic: '',
      city: '',
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      description="Join AMG Academy to register for events and access your learning workspace."
    >
      <AuthForm
        form={form}
        fields={[
          { name: 'name', label: 'Full name', autoComplete: 'name' },
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            autoComplete: 'new-password',
          },
          { name: 'phone', label: 'Phone', autoComplete: 'tel' },
          { name: 'specialty', label: 'Specialty' },
          { name: 'clinic', label: 'Clinic' },
          { name: 'city', label: 'City' },
        ]}
        submitLabel="Create account"
        isSubmitting={form.formState.isSubmitting}
        onSubmit={async (values) => {
          const response = await api.post<ApiEnvelope<RegisterResponse>>('/auth/register', values);
          const verificationUrl = response.data.data.verificationUrl;

          if (verificationUrl) {
            toast.success('Account created. Verifying your email in this local environment.');
            window.location.href = verificationUrl;
            return;
          }

          toast.success('Account created. Check your email for the verification link.');
          window.location.href = `/verify-email?sent=1&email=${encodeURIComponent(values.email)}`;
        }}
        footer={
          <span>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-secondary hover:text-text-primary">
              Sign in
            </Link>
          </span>
        }
      />
    </AuthLayout>
  );
}
