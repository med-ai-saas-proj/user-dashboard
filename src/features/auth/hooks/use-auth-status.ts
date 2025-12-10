import { useAuthStore } from '@/features/auth/store/auth-store';

// TODO: Improve this hook later
export const useAuthStatus = () => {
  const token = useAuthStore((state) => state.token);
  return !!token;
};
