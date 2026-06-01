import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from '../../src/features/profile/profile.hooks';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const profile = profileQuery.data;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [city, setCity] = useState('');
  const [saved, setSaved] = useState(false);
  const updateError = updateProfile.error ? mapApiErrorToUi(updateProfile.error) : null;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name ?? '');
    setPhone(profile.phone ?? '');
    setSpecialty(profile.specialty ?? '');
    setClinic(profile.clinic ?? '');
    setCity(profile.city ?? '');
  }, [profile]);

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <LoadingState title="Loading profile" message="Fetching editable profile fields." />
      </Screen>
    );
  }

  if (profileQuery.isError || !profile) {
    const error = profileQuery.error ? mapApiErrorToUi(profileQuery.error) : null;
    return (
      <Screen>
        <ErrorState
          title={error?.title ?? 'Profile unavailable'}
          message={error?.message ?? 'Profile details could not be loaded.'}
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <Header
        title="Edit Profile"
        subtitle="Updates are validated and saved by the backend."
        action={<Button label="Back" variant="secondary" size="sm" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.formCard}>
        <TextField
          label="Name"
          value={name}
          onChangeText={(value) => {
            setSaved(false);
            setName(value);
          }}
          placeholder="Your name"
        />
        <TextField
          label="Phone"
          value={phone}
          onChangeText={(value) => {
            setSaved(false);
            setPhone(value);
          }}
          placeholder="+20..."
          keyboardType="phone-pad"
        />
        <TextField
          label="Specialty"
          value={specialty}
          onChangeText={(value) => {
            setSaved(false);
            setSpecialty(value);
          }}
          placeholder="Dental specialty"
        />
        <TextField
          label="Clinic"
          value={clinic}
          onChangeText={(value) => {
            setSaved(false);
            setClinic(value);
          }}
          placeholder="Clinic name"
        />
        <TextField
          label="City"
          value={city}
          onChangeText={(value) => {
            setSaved(false);
            setCity(value);
          }}
          placeholder="City"
        />

        {updateError ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.errorTitle}>{updateError.title}</Text>
            <Text style={styles.errorMessage}>{updateError.message}</Text>
          </View>
        ) : null}

        {saved ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Profile saved.</Text>
          </View>
        ) : null}

        <Button
          label="Save changes"
          loading={updateProfile.isPending}
          onPress={() => {
            void updateProfile.mutateAsync({
              name: name.trim(),
              phone: phone.trim(),
              specialty: specialty.trim(),
              clinic: clinic.trim(),
              city: city.trim(),
            }).then(() => {
              setSaved(true);
            }).catch(() => {
              // Mutation state renders the backend validation or network error.
            });
          }}
        />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  formCard: {
    gap: spacing.md,
  },
  feedbackBox: {
    gap: spacing.xxs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.44)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: spacing.md,
  },
  errorTitle: {
    ...textStyles.label,
    color: colors.status.error,
  },
  errorMessage: textStyles.body,
  successBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.34)',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    padding: spacing.md,
  },
  successText: {
    ...textStyles.label,
    color: colors.status.success,
  },
});
