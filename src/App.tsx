import "./config/i18n";

import { ThemeProvider } from "next-themes";
import { KeycloakProvider } from "@/features/auth/providers/keycloak-provider";
import { query_client } from "@/query/query-client";
import APIKeysPage from "@/routes/api-keys";
import APIReferencePage from "@/routes/api-reference";
import EHRSummaryPage from "@/routes/ehr-summary";
import LoginPage from "@/routes/login";
import { ProtectedRoute } from "@/routes/protected-route";
import { PublicRoute } from "@/routes/public-route";
import RxAdvisorPage from "@/routes/rx-advisor";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, useRef } from "react";
import PlaygroundChatPage from "./routes/playground-chat";
import PlaygroundAISearchPage from "@/routes/playground-ai-search";
import EhrConverterPage from "@/routes/ehr-converter";
import DocumentToFhirPage from "@/routes/document-to-fhir";
import KnowledgeBasePage from "@/routes/knowledge-base";
import BhxhValidatorPage from "@/routes/bhxh-validator";
import VoiceTranscribePage from "@/routes/voice-transcribe";
import MedicalImagePage from "@/routes/medical-image";
import HealthScorePage from "@/routes/health-score";
import DataMaskingPage from "@/routes/data-masking";
import PatientHistoryPage from "@/routes/patient-history";
import WearableDataPage from "@/routes/wearable-data";
import ArchitecturePage from "@/routes/architecture";
import IntegrationDashboardPage from "@/routes/integration-dashboard";
import PublicHealthPage from "@/routes/public-health";
import ApiFlowBuilderPage from "@/routes/api-flow-builder";
import SettingsPage from "@/routes/settings";
import BillingPage from "@/routes/billing";
import UpgradePage from "@/routes/upgrade";
import DashboardBuilderPage from "@/routes/dashboard-builder";
import SymptomCheckerPage from "@/routes/symptom-checker";
import ClinicSearchPage from "@/routes/clinic-search";
import DigitalTwinPage from "@/routes/digital-twin";
import FederatedLearningPage from "@/routes/federated-learning";
import HealthcareDashboardPage from "@/routes/healthcare-dashboard";

function PreventScrollReset() {
	const location = useLocation();
	const isFirstRender = useRef(true);
	const prevPathname = useRef(location.pathname);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			prevPathname.current = location.pathname;
			return;
		}
		prevPathname.current = location.pathname;
	});

	useEffect(() => {
		const original = window.scrollTo;
		window.scrollTo = (...args: Parameters<typeof window.scrollTo>) => {
			if (
				args.length === 1 &&
				typeof args[0] === "object" &&
				args[0]?.top === 0
			) {
				return;
			}
			if (args.length === 2 && args[0] === 0 && args[1] === 0) {
				return;
			}
			original.apply(window, args);
		};
		return () => {
			window.scrollTo = original;
		};
	}, []);

	return null;
}

function AppRoutes() {
	return (
		<>
			<PreventScrollReset />
			<Routes>
				<Route
					path="/login"
					element={
						<PublicRoute>
							<LoginPage />
						</PublicRoute>
					}
				/>
				{/* TODO: Replace with main home page later, temporarily redirecting to /chat for now */}
				<Route path="/" element={<Navigate to="/chat" replace />} />
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
					path="/chat"
					element={
						<ProtectedRoute>
							<PlaygroundChatPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/ai-search"
					element={
						<ProtectedRoute>
							<PlaygroundAISearchPage />
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

				<Route
					path="/ehr-converter"
					element={
						<ProtectedRoute>
							<EhrConverterPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/document-to-fhir"
					element={
						<ProtectedRoute>
							<DocumentToFhirPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/knowledge-base"
					element={
						<ProtectedRoute>
							<KnowledgeBasePage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/bhxh-validator"
					element={
						<ProtectedRoute>
							<BhxhValidatorPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/voice-transcribe"
					element={
						<ProtectedRoute>
							<VoiceTranscribePage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/medical-image"
					element={
						<ProtectedRoute>
							<MedicalImagePage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/health-score"
					element={
						<ProtectedRoute>
							<HealthScorePage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/data-masking"
					element={
						<ProtectedRoute>
							<DataMaskingPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/patient-history"
					element={
						<ProtectedRoute>
							<PatientHistoryPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/wearable-data"
					element={
						<ProtectedRoute>
							<WearableDataPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/architecture"
					element={
						<ProtectedRoute>
							<ArchitecturePage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/integration"
					element={
						<ProtectedRoute>
							<IntegrationDashboardPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/public-health"
					element={
						<ProtectedRoute>
							<PublicHealthPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/api-flow-builder"
					element={
						<ProtectedRoute>
							<ApiFlowBuilderPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/dashboard-builder"
					element={
						<ProtectedRoute>
							<DashboardBuilderPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/symptom-checker"
					element={
						<ProtectedRoute>
							<SymptomCheckerPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/clinic-search"
					element={
						<ProtectedRoute>
							<ClinicSearchPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/digital-twin"
					element={
						<ProtectedRoute>
							<DigitalTwinPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/federated-learning"
					element={
						<ProtectedRoute>
							<FederatedLearningPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/healthcare-dashboard"
					element={
						<ProtectedRoute>
							<HealthcareDashboardPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<SettingsPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/billing"
					element={
						<ProtectedRoute>
							<BillingPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/upgrade"
					element={
						<ProtectedRoute>
							<UpgradePage />
						</ProtectedRoute>
					}
				/>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

function App() {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<QueryClientProvider client={query_client}>
				<KeycloakProvider>
					<BrowserRouter>
						<Toaster />
						<AppRoutes />
					</BrowserRouter>
				</KeycloakProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default App;
