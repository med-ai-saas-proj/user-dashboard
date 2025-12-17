import Keycloak from 'keycloak-js';

if (
  !(
    import.meta.env.VITE_KEYCLOAK_URL &&
    import.meta.env.VITE_KEYCLOAK_REALM &&
    import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  )
) {
  throw new Error('Keycloak environment variables are not properly defined');
}

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
