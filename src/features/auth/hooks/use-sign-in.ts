import { useMutation } from '@tanstack/react-query';
import { signIn } from '@/features/auth/api/services/sign-in';
import { useAuthStore } from '@/features/auth/store/auth-store';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const data = await signIn(credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.refresh_token, data.expire_in);
    },
  });
};
