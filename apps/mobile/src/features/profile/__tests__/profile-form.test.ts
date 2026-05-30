import { normalizeProfile } from '../profile.api';

describe('profile form mapping', () => {
  const fullProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+201234567890',
    specialty: 'Cardiology',
    clinic: 'AMG Clinic',
    city: 'Cairo',
    avatarUrl: 'https://example.com/avatar.jpg',
    emailVerified: true,
    role: 'user',
    createdAt: '2026-01-01T00:00:00Z',
  };

  it('normalizes a full profile without changes', () => {
    expect(normalizeProfile(fullProfile)).toEqual(fullProfile);
  });

  it('handles null optional fields', () => {
    const minimal = {
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: null,
      specialty: null,
      clinic: null,
      city: null,
      avatarUrl: null,
      emailVerified: false,
      role: 'user',
      createdAt: '2026-02-01T00:00:00Z',
    };

    const result = normalizeProfile(minimal);
    expect(result.phone).toBeNull();
    expect(result.specialty).toBeNull();
    expect(result.clinic).toBeNull();
    expect(result.city).toBeNull();
    expect(result.avatarUrl).toBeNull();
  });

  it('preserves email verification state', () => {
    const verified = normalizeProfile({ ...fullProfile, emailVerified: true });
    const unverified = normalizeProfile({ ...fullProfile, emailVerified: false });

    expect(verified.emailVerified).toBe(true);
    expect(unverified.emailVerified).toBe(false);
  });

  it('preserves role field', () => {
    const admin = normalizeProfile({ ...fullProfile, role: 'admin' });
    const scanner = normalizeProfile({ ...fullProfile, role: 'scanner' });

    expect(admin.role).toBe('admin');
    expect(scanner.role).toBe('scanner');
  });
});
