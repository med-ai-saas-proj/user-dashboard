import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { KeycloakProvider } from '@/features/auth/providers/keycloak-provider';
import { query_client } from '@/query/query-client';
import APIKeysPage from '@/routes/api-keys';
import APIReferencePage from '@/routes/api-reference';
import EHRSummaryPage from '@/routes/ehr-summary';
import DashboardPage from '@/routes/home';
import LoginPage from '@/routes/login';
import { ProtectedRoute } from '@/routes/protected-route';
import { PublicRoute } from '@/routes/public-route';
import RxAdvisorPage from '@/routes/rx-advisor';

function App() {
  return (
    <QueryClientProvider client={query_client}>
      <KeycloakProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-keys"
              element={
                <ProtectedRoute>
                  <APIKeysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/api-reference"
              element={
                <ProtectedRoute>
                  <APIReferencePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ehr-summary"
              element={
                <ProtectedRoute>
                  <EHRSummaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rx-advisor"
              element={
                <ProtectedRoute>
                  <RxAdvisorPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </KeycloakProvider>
    </QueryClientProvider>
  );
}

export default App;
