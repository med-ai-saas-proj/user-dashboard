import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://10.120.9.216:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'dev-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-app',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
