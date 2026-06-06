'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { countryDialCodes } from '@/lib/country-dial-codes';

export type GoogleProfileValues = {
  name: string;
  phone: string;
  specialty: string;
  clinic: string;
  city: string;
  professionalTitle?: string;
  practiceType?: string;
  yearsOfExperience?: number;
};

export type GoogleProfileSeed = Partial<GoogleProfileValues> & {
  email: string;
  avatarUrl?: string | null;
};

const requiredFields: Array<keyof Pick<GoogleProfileValues, 'name' | 'phone' | 'specialty' | 'clinic' | 'city'>> = [
  'name',
  'phone',
  'specialty',
  'clinic',
  'city',
];

function formatPhone(dialCode: string, phone: string) {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone || trimmedPhone.startsWith('+')) {
    return trimmedPhone;
  }

  return `${dialCode}${trimmedPhone.replace(/^0+/, '')}`;
}

export function GoogleProfileCompletionForm({
  profile,
  isSubmitting,
  onSubmit,
}: {
  profile: GoogleProfileSeed;
  isSubmitting?: boolean;
  onSubmit: (values: GoogleProfileValues) => Promise<void> | void;
}) {
  const defaultCountry = countryDialCodes[0] ?? { country: 'Egypt', code: '+20', flag: 'EG' };
  const [dialCode, setDialCode] = useState(defaultCountry.code);
  const [values, setValues] = useState<GoogleProfileValues>({
    name: profile.name ?? '',
    phone: profile.phone ?? '',
    specialty: profile.specialty ?? '',
    clinic: profile.clinic ?? '',
    city: profile.city ?? '',
    professionalTitle: profile.professionalTitle ?? '',
    practiceType: profile.practiceType ?? '',
    yearsOfExperience: profile.yearsOfExperience,
  });
  const [yearsText, setYearsText] = useState(
    profile.yearsOfExperience === undefined ? '' : String(profile.yearsOfExperience),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof GoogleProfileValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = requiredFields.reduce<Record<string, string>>((fieldErrors, field) => {
          if (!String(values[field] ?? '').trim()) {
            fieldErrors[field] = 'Required';
          }
          return fieldErrors;
        }, {});

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
          return;
        }

        void onSubmit({
          ...values,
          phone: formatPhone(dialCode, values.phone),
          yearsOfExperience: yearsText.trim() ? Number(yearsText.trim()) : undefined,
        });
      }}
    >
      <div className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-text-secondary">
        Google verified <span className="font-semibold text-text-primary">{profile.email}</span>.
        Complete your AMG Academy profile to continue.
      </div>

      <Input
        label="Full name"
        value={values.name}
        onChange={(event) => updateField('name', event.target.value)}
        error={errors.name}
      />

      <div className="flex w-full flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Phone</span>
        <div className="grid gap-2 sm:grid-cols-[11.5rem_1fr]">
          <select
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
            inputMode="tel"
            placeholder="Phone number"
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            error={errors.phone}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Specialty"
          value={values.specialty}
          onChange={(event) => updateField('specialty', event.target.value)}
          error={errors.specialty}
        />
        <Input
          label="Clinic"
          value={values.clinic}
          onChange={(event) => updateField('clinic', event.target.value)}
          error={errors.clinic}
        />
      </div>
      <Input
        label="City"
        value={values.city}
        onChange={(event) => updateField('city', event.target.value)}
        error={errors.city}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Professional title"
          value={values.professionalTitle}
          onChange={(event) => updateField('professionalTitle', event.target.value)}
          placeholder="Consultant, Resident, GP dentist"
        />
        <Input
          label="Practice type"
          value={values.practiceType}
          onChange={(event) => updateField('practiceType', event.target.value)}
          placeholder="Private clinic, hospital, university"
        />
      </div>
      <Input
        label="Years of experience"
        inputMode="numeric"
        value={yearsText}
        onChange={(event) => setYearsText(event.target.value)}
        placeholder="5"
      />
      <Button className="w-full" type="submit" loading={isSubmitting}>
        Complete profile
      </Button>
    </form>
  );
}
