import 'i18next';
import type commonEN from '../public//locales/en/common.json';
import type sidebarEN from '../public/locales/en/sidebar.json';
import type apiKeysEN from '../public/locales/en/api-keys.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof commonEN;
      sidebar: typeof sidebarEN;
      'api-keys': typeof apiKeysEN;
    };
  }
}
