import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import keycloak, { initKeycloak } from '@/config/keycloak';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface KeycloakContextType {
  keycloak: typeof keycloak;
  initialized: boolean;
  authenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(
  undefined
);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { setAuth, logout } = useAuthStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is intended to run only once on mount
  useEffect(() => {
    initKeycloak()
      .then((auth) => {
        setAuthenticated(auth);
        setInitialized(true);

        if (auth && keycloak.token && keycloak.refreshToken) {
          const expiresIn = keycloak.tokenParsed?.exp
            ? keycloak.tokenParsed.exp - Math.floor(Date.now() / 1000)
            : 3600;
          setAuth(keycloak.token, keycloak.refreshToken, expiresIn);
        }

        // Auto-refresh token
        keycloak.onTokenExpired = () => {
          keycloak
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed && keycloak.token && keycloak.refreshToken) {
                const expiresIn = keycloak.tokenParsed?.exp
                  ? keycloak.tokenParsed.exp - Math.floor(Date.now() / 1000)
                  : 3600;
                setAuth(keycloak.token, keycloak.refreshToken, expiresIn);
              }
            })
            .catch(() => {
              logout();
              keycloak.logout();
            });
        };
      })
      .catch((error) => {
        console.error('Keycloak initialization failed', error);
        setInitialized(true);
      });
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized, authenticated }}>
      {initialized ? children : <div>Loading...</div>}
    </KeycloakContext.Provider>
  );
};

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (!context) {
    throw new Error('useKeycloak must be used within KeycloakProvider');
  }
  return context;
};
