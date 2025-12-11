import { useMutation } from '@tanstack/react-query';
import { signOut } from '@/features/auth/api/services/sign-out';
import { useKeycloak } from '@/features/auth/providers/keycloak-provider';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useSignOut = () => {
  const { keycloak } = useKeycloak();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSettled: () => {
      logout();
      if (keycloak.authenticated) {
        keycloak.logout({ redirectUri: window.location.origin + '/login' });
      }
    },
  });
};
