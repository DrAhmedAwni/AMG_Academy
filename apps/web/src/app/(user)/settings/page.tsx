'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { changePasswordSchema } from '@amg/shared';
import { Button, Card, Input } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type PasswordValues = {
  currentPassword: string;
  newPassword: string;
};

const preferenceKeys = [
  { id: 'emailNotifications', label: 'Email alerts for account activity' },
  { id: 'courseUpdates', label: 'Course and content update emails' },
  { id: 'eventReminders', label: 'Event reminders and registration notices' },
] as const;

type PreferenceState = Record<(typeof preferenceKeys)[number]['id'], boolean>;

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<PreferenceState>({
    emailNotifications: true,
    courseUpdates: true,
    eventReminders: true,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await api.get('/notifications/preferences');
      return response.data.data as {
        email: boolean;
        inApp: boolean;
        registrationUpdates: boolean;
        paymentUpdates: boolean;
        courseUpdates: boolean;
        eventReminders: boolean;
      };
    },
  });

  const form = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  useEffect(() => {
    if (!preferencesQuery.data) {
      return;
    }

    setPreferences({
      emailNotifications: preferencesQuery.data.email,
      courseUpdates: preferencesQuery.data.courseUpdates,
      eventReminders: preferencesQuery.data.eventReminders,
    });
  }, [preferencesQuery.data]);

  if (preferencesQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (preferencesQuery.isError) {
    return (
      <ErrorState
        title="Settings could not be loaded."
        description="Please retry once the notification service is reachable again."
        onRetry={() => void preferencesQuery.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Notification preferences</h2>
        <div className="mt-6 grid gap-4">
          {preferenceKeys.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between rounded-md border border-surface-border bg-surface-elevated px-4 py-3"
            >
              <span className="text-sm text-text-primary">{item.label}</span>
              <input
                type="checkbox"
                checked={preferences[item.id]}
                aria-label={item.label}
                onChange={async (event) => {
                  const next = {
                    ...preferences,
                    [item.id]: event.target.checked,
                  };
                  setPreferences(next);

                  setSavingPreferences(true);
                  try {
                    await api.patch('/notifications/preferences', {
                      email: next.emailNotifications,
                      inApp: true,
                      registrationUpdates: true,
                      paymentUpdates: true,
                      courseUpdates: next.courseUpdates,
                      eventReminders: next.eventReminders,
                    });
                    toast.success('Preferences updated.');
                  } catch {
                    setPreferences(preferences);
                    toast.error('We could not save your preferences.');
                  } finally {
                    setSavingPreferences(false);
                  }
                }}
                disabled={savingPreferences}
              />
            </label>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Change password</h2>
        <form
          className="mt-6 grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await api.post('/auth/change-password', values);
            form.reset();
            toast.success('Password updated successfully.');
          })}
        >
          <Input
            type="password"
            label="Current password"
            autoComplete="current-password"
            error={form.formState.errors.currentPassword?.message}
            {...form.register('currentPassword')}
          />
          <Input
            type="password"
            label="New password"
            autoComplete="new-password"
            error={form.formState.errors.newPassword?.message}
            {...form.register('newPassword')}
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
