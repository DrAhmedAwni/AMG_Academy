'use client';

import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { Button, Input } from '@/components/ui';

type AuthField<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

export function AuthForm<TFieldValues extends FieldValues>({
  form,
  fields,
  submitLabel,
  onSubmit,
  footer,
  isSubmitting = false,
}: {
  form: UseFormReturn<TFieldValues>;
  fields: AuthField<TFieldValues>[];
  submitLabel: string;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  footer?: React.ReactNode;
  isSubmitting?: boolean;
}) {
  const formError = getErrorMessage(form.formState.errors.root);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field) => (
        <Input
          key={field.name}
          type={field.type ?? 'text'}
          label={field.label}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          required={field.required}
          error={getErrorMessage(form.formState.errors[field.name])}
          {...form.register(field.name)}
        />
      ))}
      {formError ? (
        <div className="rounded-md border border-status-error/40 bg-status-error/10 px-3 py-2 text-sm text-status-error">
          {formError}
        </div>
      ) : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Working...' : submitLabel}
      </Button>
      {footer ? <div className="pt-2 text-sm text-text-secondary">{footer}</div> : null}
    </form>
  );
}
