'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { registerSchema } from '@amg/shared';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import {
  GoogleProfileCompletionForm,
  type GoogleProfileSeed,
  type GoogleProfileValues,
} from '@/components/forms/GoogleProfileCompletionForm';
import { AuthLayout } from '@/components/layouts';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { countryDialCodes } from '@/lib/country-dial-codes';
import { useAuth } from '@/hooks/useAuth';

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

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

function formatPhone(dialCode: string, phone?: string) {
  const trimmedPhone = phone?.trim();
  if (!trimmedPhone) {
    return '';
  }

  if (trimmedPhone.startsWith('+')) {
    return trimmedPhone;
  }

  return `${dialCode}${trimmedPhone.replace(/^0+/, '')}`;
}

export default function RegisterPage() {
  const {
    completeGoogleProfile,
    googleLoginPending,
    googleProfilePending,
    loginWithGoogle,
  } = useAuth();
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
  const formError = getErrorMessage(form.formState.errors.root);
  const defaultCountry = countryDialCodes[0] ?? { country: 'Egypt', code: '+20', flag: '🇪🇬' };
  const [dialCode, setDialCode] = useState(defaultCountry.code);
  const [googleProfileStep, setGoogleProfileStep] = useState<{
    idToken: string;
    profile: GoogleProfileSeed;
  } | null>(null);
  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      const response = await loginWithGoogle({ idToken });
      if ('needsProfile' in response.result) {
        setGoogleProfileStep({ idToken, profile: response.result.profile });
      }
    },
    [loginWithGoogle],
  );

  return (
    <AuthLayout
      title={googleProfileStep ? 'Complete your Google profile' : 'Create your account'}
      description={
        googleProfileStep
          ? 'Google verified your email. Confirm your professional details to activate your account.'
          : 'Join AMG Academy to register for events and access your learning workspace.'
      }
    >
      {googleProfileStep ? (
        <GoogleProfileCompletionForm
          profile={googleProfileStep.profile}
          isSubmitting={googleProfilePending}
          onSubmit={async (values: GoogleProfileValues) => {
            await completeGoogleProfile({
              values: {
                ...values,
                idToken: googleProfileStep.idToken,
              },
            });
          }}
        />
      ) : (
        <div className="space-y-5">
          <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
          {googleLoginPending ? (
            <p className="text-center text-sm text-text-secondary">Checking your Google account...</p>
          ) : null}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-surface-border/80" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-surface-border/80" />
          </div>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          const response = await api.post<ApiEnvelope<RegisterResponse>>('/auth/register', {
            ...values,
            phone: formatPhone(dialCode, values.phone),
          });
          const verificationUrl = response.data.data.verificationUrl;

          if (verificationUrl) {
            toast.success('Account created. Verifying your email in this local environment.');
            window.location.href = verificationUrl;
            return;
          }

          toast.success('Account created. Check your email for the verification link.');
          window.location.href = `/verify-email?sent=1&email=${encodeURIComponent(values.email)}`;
        })}
      >
        <Input
          label="Full name"
          autoComplete="name"
          error={getErrorMessage(form.formState.errors.name)}
          {...form.register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={getErrorMessage(form.formState.errors.email)}
          {...form.register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={getErrorMessage(form.formState.errors.password)}
          {...form.register('password')}
        />

        <div className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Phone</span>
          <div className="grid gap-2 sm:grid-cols-[11.5rem_1fr]">
            <label className="sr-only" htmlFor="register-country-code">
              Country code
            </label>
            <select
              id="register-country-code"
              value={dialCode}
              onChange={(event) => setDialCode(event.target.value)}
              className="h-10 w-full rounded-xl border border-surface-border/70 bg-surface-card/90 px-3 text-sm text-text-primary shadow-sm transition-all duration-200 focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20"
            >
              {countryDialCodes.map((country) => (
                <option key={`${country.country}-${country.code}`} value={country.code}>
                  {country.flag} {country.code} {country.country}
                </option>
              ))}
            </select>
            <Input
              autoComplete="tel-national"
              inputMode="tel"
              placeholder="Phone number"
              error={getErrorMessage(form.formState.errors.phone)}
              {...form.register('phone')}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Specialty"
            error={getErrorMessage(form.formState.errors.specialty)}
            {...form.register('specialty')}
          />
          <Input
            label="Clinic"
            error={getErrorMessage(form.formState.errors.clinic)}
            {...form.register('clinic')}
          />
        </div>
        <Input label="City" error={getErrorMessage(form.formState.errors.city)} {...form.register('city')} />

        {formError ? (
          <div className="rounded-md border border-status-error/40 bg-status-error/10 px-3 py-2 text-sm text-status-error">
            {formError}
          </div>
        ) : null}

        <Button className="w-full" type="submit" loading={form.formState.isSubmitting}>
          Create account
        </Button>

        <div className="pt-2 text-sm text-text-secondary">
          <span>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-secondary hover:text-text-primary">
              Sign in
            </Link>
          </span>
        </div>
      </form>
        </div>
      )}
    </AuthLayout>
  );
}
