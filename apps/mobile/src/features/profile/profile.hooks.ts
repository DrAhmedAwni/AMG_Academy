import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfileUpdateInput } from './profile.api';
import * as profileApi from './profile.api';

export const profileQueryKeys = {
  all: ['profile'] as const,
  detail: () => [...profileQueryKeys.all, 'detail'] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: profileQueryKeys.detail(),
    queryFn: () => profileApi.getProfile(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileApi.updateProfile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (args: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(args.currentPassword, args.newPassword),
  });
}
