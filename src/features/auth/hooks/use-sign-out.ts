import { useMutation } from '@tanstack/react-query';
import { signOut } from '@/features/auth/api/services/sign-out';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useSignOut = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      logout();
      // TODO: Calling the service signout, but a bit misleading so might have to refactor
      await signOut();
    },
    onSuccess: () => {
      logout();
    },
  });
};
