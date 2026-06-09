import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import {
  useCreateCaseCategoryMutation,
  useCreateCaseMutation,
  useCaseCategoriesQuery,
} from '../../src/features/cases/cases.hooks';
import { mapApiErrorToUi, fieldError } from '../../src/lib/errors';
import { colors, spacing, textStyles } from '../../src/theme';

export default function CaseSubmitScreen() {
  const router = useRouter();
  const createMutation = useCreateCaseMutation();
  const createCategoryMutation = useCreateCaseCategoryMutation();
  const categoriesQuery = useCaseCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const error = createMutation.error ? mapApiErrorToUi(createMutation.error) : null;
  const titleError = fieldError(createMutation.error, 'title');
  const descriptionError = fieldError(createMutation.error, 'description');
  const categoryError = fieldError(createMutation.error, 'categoryId');

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (name.length < 2) return;

    const category = await createCategoryMutation.mutateAsync(name);
    setCategoryId(category.id);
    setNewCategoryName('');
    setShowCategories(false);
  };

  const handleSubmit = () => {
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createMutation.mutate(
      { title: title.trim(), description: description.trim(), categoryId, tags },
      {
        onSuccess: () => {
          Alert.alert(
            'Waiting for admin approval',
            'Your case was submitted for review. It will become available after an admin approves it from the dashboard.',
            [{ text: 'OK', onPress: () => router.back() }],
          );
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

      <View style={styles.formPanel}>
        <View style={styles.formHeading}>
          <Text style={styles.formTitle}>Case details</Text>
          <Text style={styles.formSubtitle}>Give moderators enough context to review your case.</Text>
        </View>

        <TextField
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Management of complex root perforation"
          error={titleError}
        />

        <TextField
          label="Clinical question *"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the clinical presentation, findings, and questions..."
          multiline
          numberOfLines={6}
          error={descriptionError}
        />

        <TextField
          label="Category *"
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
            {categoriesQuery.isLoading ? (
              <Text style={styles.mutedText}>Loading categories...</Text>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
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
              ))
            ) : (
              <Text style={styles.mutedText}>No categories yet. Add the first one below.</Text>
            )}
            <View style={styles.newCategoryRow}>
              <TextField
                label="New category"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="e.g., Endodontics"
                style={styles.newCategoryInput}
              />
              <Button
                label="Add"
                variant="secondary"
                size="sm"
                loading={createCategoryMutation.isPending}
                disabled={newCategoryName.trim().length < 2}
                onPress={() => {
                  void handleCreateCategory();
                }}
              />
            </View>
          </GlassCard>
        ) : null}

        <TextField
          label="Tags"
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="e.g., endodontics, perforation, retreatment"
          helperText="Separate tags with commas"
        />
      </View>

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
  reminderText: {
    ...textStyles.caption,
    flex: 1,
    color: colors.accent.primary,
  },
  categoryList: {
    gap: spacing.xs,
  },
  newCategoryRow: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  newCategoryInput: {
    minHeight: 48,
  },
  mutedText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  formError: {
    ...textStyles.caption,
    color: colors.status.error,
    textAlign: 'center',
  },
});
