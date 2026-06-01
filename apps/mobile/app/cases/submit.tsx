import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { useCreateCaseMutation, useCaseCategoriesQuery } from '../../src/features/cases/cases.hooks';
import { mapApiErrorToUi, fieldError } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

export default function CaseSubmitScreen() {
  const router = useRouter();
  const createMutation = useCreateCaseMutation();
  const categoriesQuery = useCaseCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const error = createMutation.error ? mapApiErrorToUi(createMutation.error) : null;
  const titleError = fieldError(createMutation.error, 'title');
  const descriptionError = fieldError(createMutation.error, 'description');
  const categoryError = fieldError(createMutation.error, 'categoryId');

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = () => {
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate(
      { title: title.trim(), description: description.trim(), categoryId, tags },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  const isValid = title.trim().length > 0 && description.trim().length > 0 && categoryId.length > 0;

  return (
    <Screen>
      <Header
        title="Submit a Case"
        subtitle="Share a clinical case for peer discussion."
        action={<Button label="Cancel" variant="secondary" size="sm" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.reminder}>
        <Ionicons name="shield-checkmark" size={20} color={colors.accent.primary} />
        <Text style={styles.reminderText}>
          De-identification reminder: Remove all patient-identifiable information before submitting.
        </Text>
      </GlassCard>

      <TextField
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Management of complex root perforation"
        error={titleError}
      />

      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the clinical presentation, findings, and questions..."
        multiline
        numberOfLines={6}
        error={descriptionError}
      />

      <TextField
        label="Category"
        value={selectedCategory?.name ?? 'Select a category'}
        placeholder="Select a category"
        error={categoryError}
        editable={false}
        onPress={() => setShowCategories(!showCategories)}
        rightAction={
          <Ionicons
            name={showCategories ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text.muted}
          />
        }
      />

      {showCategories ? (
        <GlassCard style={styles.categoryList}>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              label={cat.name}
              variant={categoryId === cat.id ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => {
                setCategoryId(cat.id);
                setShowCategories(false);
              }}
            />
          ))}
        </GlassCard>
      ) : null}

      <TextField
        label="Tags"
        value={tagsText}
        onChangeText={setTagsText}
        placeholder="e.g., endodontics, perforation, retreatment"
        helperText="Separate tags with commas"
      />

      {error && error.kind !== 'validation' ? (
        <Text style={styles.formError}>{error.message}</Text>
      ) : null}

      <Button
        label="Submit Case"
        variant="primary"
        loading={createMutation.isPending}
        disabled={!isValid}
        onPress={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  reminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(84, 217, 232, 0.08)',
    borderColor: 'rgba(84, 217, 232, 0.24)',
  },
  reminderText: {
    ...textStyles.caption,
    flex: 1,
    color: colors.accent.primary,
  },
  categoryList: {
    gap: spacing.xs,
  },
  formError: {
    ...textStyles.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
});
