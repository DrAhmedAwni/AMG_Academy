'use client';

import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { updateProfileSchema } from '@amg/shared';
import { Card, Button, Input } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';

type ProfileValues = {
  name: string;
  phone?: string;
  specialty?: string;
  clinic?: string;
  city?: string;
  avatarUrl?: string;
};

type ProfileResponse = ProfileValues & {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
};

export default function ProfilePage() {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
      specialty: '',
      clinic: '',
      city: '',
      avatarUrl: '',
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: ProfileResponse }>('/users/profile');
      return response.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileValues) => {
      const response = await api.patch<{ success: boolean; data: ProfileResponse }>('/users/profile', values);
      return response.data.data;
    },
    onSuccess: (data) => {
      form.reset({
        name: data.name,
        phone: data.phone,
        specialty: data.specialty,
        clinic: data.clinic,
        city: data.city,
        avatarUrl: data.avatarUrl,
      });
      toast.success('Profile updated successfully.');
    },
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    form.reset({
      name: profileQuery.data.name,
      phone: profileQuery.data.phone,
      specialty: profileQuery.data.specialty,
      clinic: profileQuery.data.clinic,
      city: profileQuery.data.city,
      avatarUrl: profileQuery.data.avatarUrl,
    });
  }, [form, profileQuery.data]);

  if (profileQuery.isLoading) {
    return <LoadingSkeleton lines={6} />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="We couldn’t load your profile."
        description="Please retry once the account service is reachable again."
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Profile details</h2>
        <dl className="mt-4 grid gap-3 text-sm text-text-secondary">
          <div className="flex items-center justify-between">
            <dt>Email</dt>
            <dd className="text-text-primary">{profileQuery.data.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Role</dt>
            <dd className="text-text-primary">{profileQuery.data.role}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Verification</dt>
            <dd className="text-text-primary">{profileQuery.data.emailVerified ? 'Verified' : 'Pending'}</dd>
          </div>
        </dl>
      </Card>
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Edit profile</h2>
        <form
          className="mt-6 grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await saveMutation.mutateAsync(values);
          })}
        >
          <Input label="Name" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Phone" error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <Input
            label="Specialty"
            error={form.formState.errors.specialty?.message}
            {...form.register('specialty')}
          />
          <Input label="Clinic" error={form.formState.errors.clinic?.message} {...form.register('clinic')} />
          <Input label="City" error={form.formState.errors.city?.message} {...form.register('city')} />
          <Input
            label="Avatar URL"
            error={form.formState.errors.avatarUrl?.message}
            {...form.register('avatarUrl')}
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
