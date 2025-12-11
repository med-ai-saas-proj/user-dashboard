import { useKeycloak } from '@/features/auth/providers/keycloak-provider';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useAuthStatus = () => {
  const { authenticated } = useKeycloak();
  const token = useAuthStore((state) => state.token);
  return authenticated || !!token;
};
