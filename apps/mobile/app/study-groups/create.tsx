import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { useCreateStudyGroupMutation } from '../../src/features/study-groups/study-groups.hooks';
import type { StudyGroupType, JoinMode } from '../../src/features/study-groups/study-groups.api';
import { mapApiErrorToUi, fieldError } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

export default function CreateStudyGroupScreen() {
  const router = useRouter();
  const createMutation = useCreateStudyGroupMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<StudyGroupType>('STUDENT');
  const [joinMode, setJoinMode] = useState<JoinMode>('OPEN');
  const [courseId, setCourseId] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showJoinPicker, setShowJoinPicker] = useState(false);

  const error = createMutation.error ? mapApiErrorToUi(createMutation.error) : null;
  const titleError = fieldError(createMutation.error, 'title');
  const descriptionError = fieldError(createMutation.error, 'description');

  const typeOptions: { key: StudyGroupType; label: string }[] = [
    { key: 'STUDENT', label: 'Student-led' },
    { key: 'INSTRUCTOR_LED', label: 'Instructor-led' },
  ];

  const joinOptions: { key: JoinMode; label: string }[] = [
    { key: 'OPEN', label: 'Open (anyone can join)' },
    { key: 'REQUEST', label: 'Approval required' },
    { key: 'INVITE_ONLY', label: 'Invite only' },
  ];

  const handleSubmit = () => {
    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        type,
        joinMode,
        ...(type === 'INSTRUCTOR_LED' && courseId.trim() ? { courseId: courseId.trim() } : {}),
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <Screen>
      <Header
        title="Create Study Group"
        subtitle="Set up a new learning community."
        action={<Button label="Cancel" variant="secondary" size="sm" onPress={() => router.back()} />}
      />

      <View style={styles.formPanel}>
        <View style={styles.formHeading}>
          <Text style={styles.formTitle}>Group setup</Text>
          <Text style={styles.formSubtitle}>Create a focused space for shared learning.</Text>
        </View>

        <TextField
          label="Group name *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Endodontic Study Circle"
          error={titleError}
        />

        <TextField
          label="Description *"
          value={description}
          onChangeText={setDescription}
          placeholder="What will this group focus on?"
          multiline
          numberOfLines={4}
          error={descriptionError}
        />

        <TextField
          label="Group type"
          value={typeOptions.find((t) => t.key === type)?.label ?? 'Select type'}
          placeholder="Select group type"
          editable={false}
          onPress={() => setShowTypePicker(!showTypePicker)}
          rightAction={
            <Ionicons
              name={showTypePicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.muted}
            />
          }
        />

        {showTypePicker ? (
          <GlassCard style={styles.pickerList}>
            {typeOptions.map((opt) => (
              <Button
                key={opt.key}
                label={opt.label}
                variant={type === opt.key ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => {
                  setType(opt.key);
                  setShowTypePicker(false);
                }}
              />
            ))}
          </GlassCard>
        ) : null}

        <TextField
          label="Join mode"
          value={joinOptions.find((j) => j.key === joinMode)?.label ?? 'Select join mode'}
          placeholder="Select how members join"
          editable={false}
          onPress={() => setShowJoinPicker(!showJoinPicker)}
          rightAction={
            <Ionicons
              name={showJoinPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text.muted}
            />
          }
        />

        {showJoinPicker ? (
          <GlassCard style={styles.pickerList}>
            {joinOptions.map((opt) => (
              <Button
                key={opt.key}
                label={opt.label}
                variant={joinMode === opt.key ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => {
                  setJoinMode(opt.key);
                  setShowJoinPicker(false);
                }}
              />
            ))}
          </GlassCard>
        ) : null}

        {type === 'INSTRUCTOR_LED' ? (
          <TextField
            label="Course ID (optional)"
            value={courseId}
            onChangeText={setCourseId}
            placeholder="Link this group to a course"
            helperText="Only required for instructor-led course groups"
          />
        ) : null}
      </View>

      {error && error.kind !== 'validation' ? (
        <Text style={styles.formError}>{error.message}</Text>
      ) : null}

      <Button
        label="Create Group"
        variant="primary"
        loading={createMutation.isPending}
        disabled={!isValid}
        onPress={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickerList: {
    gap: spacing.xs,
  },
  formPanel: {
    gap: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.lg,
  },
  formHeading: {
    gap: spacing.xxs,
  },
  formTitle: textStyles.heading,
  formSubtitle: textStyles.body,
  formError: {
    ...textStyles.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
});
