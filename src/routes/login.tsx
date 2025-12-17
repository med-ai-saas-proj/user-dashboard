import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shadcn/button';
import { useKeycloak } from '@/features/auth/providers/keycloak-provider';

const LoginPage = () => {
  const navigate = useNavigate();
  const { keycloak, authenticated } = useKeycloak();

  const handleKeycloakLogin = () => {
    keycloak.login({
      redirectUri: window.location.origin,
    });
  };

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>

        <Button
          onClick={handleKeycloakLogin}
          size="lg"
          className="w-full rounded-full"
        >
          Sign in with SSO
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
