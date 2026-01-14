import { ApiReferenceReact } from '@scalar/api-reference-react';
import { API_ROUTES } from '@/config/api-routes';
import DashboardLayout from '@/layouts/dashboard-layout';
import '@scalar/api-reference-react/style.css';

export default function APIReferencePage() {
  return (
    <DashboardLayout pageTitle="API Reference">
      <div>
        <ApiReferenceReact
          configuration={{
            url: API_ROUTES.MANAGEMENT.DOCS_OPENAPI,
            theme: 'default',
            darkMode: false,
            hideModels: true,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
