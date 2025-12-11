import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Separator } from '@/components/shadcn/separator';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useLogin } from '@/features/auth/hooks/use-sign-in';
import { useKeycloak } from '@/features/auth/providers/keycloak-provider';

const login_schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof login_schema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(login_schema),
  });

  const { mutate, isPending, isError, error } = useLogin();
  const isAuthenticated = useAuthStatus();

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  const handleKeycloakLogin = () => {
    keycloak.login({
      redirectUri: window.location.origin + '/dashboard',
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Login</h1>
        </div>

        {/* Keycloak SSO Button */}
        <Button
          onClick={handleKeycloakLogin}
          size="lg"
          variant="outline"
          className="w-full rounded-full"
        >
          Login with SSO
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        {/* Existing form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="min-h-18">
              <Input
                type="email"
                placeholder="Email"
                disabled={isPending}
                className="rounded-full p-6"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <div className="h-5 mt-1.5 px-4">
                {errors.email && (
                  <p className="text-destructive text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="min-h-18">
              <Input
                type="password"
                placeholder="Password"
                disabled={isPending}
                className="rounded-full p-6"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <div className="h-5 mt-1.5 px-4">
                {errors.password && (
                  <p className="text-destructive text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {isError && (
            <div className="text-destructive text-sm text-center">
              {error?.message || 'Login failed. Please try again.'}
            </div>
          )}
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full rounded-full"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
