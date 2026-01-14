import 'i18next';
import type commonEN from '../public//locales/en/common.json';
import type sidebarEN from '../public/locales/en/sidebar.json';
import type apiKeysEN from '../public/locales/en/api-keys.json';
import type signInEN from '../public/locales/en/sign-in.json';
import type playgroundAISearchEN from '../public/locales/en/playground-ai-search.json';
import type playgroundRxAdvisorEN from '../public/locales/en/playground-rx-advisor.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof commonEN;
      sidebar: typeof sidebarEN;
      'api-keys': typeof apiKeysEN;
      'sign-in': typeof signInEN;
      'playground-ai-search': typeof playgroundAISearchEN;
      'playground-rx-advisor': typeof playgroundRxAdvisorEN;
    };
  }
}
