import { ApiReferenceReact } from '@scalar/api-reference-react';
import DashboardLayout from '@/layouts/dashboard-layout';
import '@scalar/api-reference-react/style.css';

export default function APIReferencePage() {
  return (
    <DashboardLayout pageTitle="API Reference">
      <div>
        <ApiReferenceReact
          configuration={{
            url: 'http://localhost:8000/docs/openapi.json',
            theme: 'default',
            darkMode: false,
            hideModels: true,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
