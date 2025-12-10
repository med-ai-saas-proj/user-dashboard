import { useMutation } from '@tanstack/react-query';
import type { RegisterRequest } from '@/features/auth/api/auth.dtos';
import { register } from '@/features/auth/api/services/register';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const data = await register(credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, '', 3600);
    },
  });
};
