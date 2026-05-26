import "./config/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useRef } from "react";
import {
	BrowserRouter,
	Navigate,
	Outlet,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { IamProvider } from "@/features/auth/providers/iam-provider";
import { query_client } from "@/query/query-client";
import A2UIPlaygroundPage from "@/routes/a2ui-playground";
import ApiFlowBuilderPage from "@/routes/api-flow-builder";
import APIKeysPage from "@/routes/api-keys";
import APIReferencePage from "@/routes/api-reference";
import ArchitecturePage from "@/routes/architecture";
import AuthCallbackPage from "@/routes/auth-callback";
import BhxhErrorCodesPage from "@/routes/bhxh-error-codes";
import BhxhValidatorPage from "@/routes/bhxh-validator";
import BillingPage from "@/routes/billing";
import BloodPanelPage from "@/routes/blood-panel";
import ClinicSearchPage from "@/routes/clinic-search";
import CrossSearchPage from "@/routes/cross-search";
import DashboardBuilderPage from "@/routes/dashboard-builder";
import DataMaskingPage from "@/routes/data-masking";
import DigitalTwinPage from "@/routes/digital-twin";
import DocumentToFhirPage from "@/routes/document-to-fhir";
import EhrConverterPage from "@/routes/ehr-converter";
import EHROverviewPage from "@/routes/ehr-overview";
import EHRSummaryPage from "@/routes/ehr-summary";
import FederatedLearningPage from "@/routes/federated-learning";
import GeneDecoderPage from "@/routes/gene-decoder";
import HealthScorePage from "@/routes/health-score";
import HealthcareDashboardPage from "@/routes/healthcare-dashboard";
import IntegrationDashboardPage from "@/routes/integration-dashboard";
import KnowledgeBasePage from "@/routes/knowledge-base";
import LoginPage from "@/routes/login";
import MedicalImagePage from "@/routes/medical-image";
import OphthSummaryPage from "@/routes/ophth-summary";
import PatientAnalyticsPage from "@/routes/patient-analytics";
import PatientHistoryPage from "@/routes/patient-history";
import PlaygroundAISearchPage from "@/routes/playground-ai-search";
import { ProtectedRoute } from "@/routes/protected-route";
import PublicHealthPage from "@/routes/public-health";
import { PublicRoute } from "@/routes/public-route";
import RegisterPage from "@/routes/register";
import RxAdvisorPage from "@/routes/rx-advisor";
import SettingsPage from "@/routes/settings";
import SymptomCheckerPage from "@/routes/symptom-checker";
import UpgradePage from "@/routes/upgrade";
import VoiceAgentPage from "@/routes/voice-agent";
import VoiceTranscribePage from "@/routes/voice-transcribe";
import WearableDataPage from "@/routes/wearable-data";
import PlaygroundChatPage from "./routes/playground-chat";

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
		window.scrollTo = ((...args: [ScrollToOptions?] | [number, number]) => {
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
			if (args.length === 1) {
				Reflect.apply(original, window, [args[0]]);
				return;
			}
			Reflect.apply(original, window, [args[0], args[1]]);
		}) as typeof window.scrollTo;
		return () => {
			window.scrollTo = original;
		};
	}, []);

	return null;
}

const dashboardRoutes = [
	"api-keys",
	"api-reference",
	"chat",
	"ai-search",
	"ehr-summary",
	"ophth-summary",
	"rx-advisor",
	"ehr-converter",
	"document-to-fhir",
	"knowledge-base",
	"bhxh-validator",
	"bhxh-error-codes",
	"voice-agent",
	"voice-transcribe",
	"medical-image",
	"health-score",
	"data-masking",
	"patient-history",
	"wearable-data",
	"architecture",
	"integration",
	"public-health",
	"api-flow-builder",
	"dashboard-builder",
	"symptom-checker",
	"gene-decoder",
	"cross-search",
	"blood-panel",
	"ehr-overview",
	"patient-analytics",
	"clinic-search",
	"digital-twin",
	"federated-learning",
	"healthcare-dashboard",
	"a2ui",
	"settings",
	"billing",
	"upgrade",
] as const;

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
				<Route
					path="/register"
					element={
						<PublicRoute>
							<RegisterPage />
						</PublicRoute>
					}
				/>
				<Route path="/auth/callback" element={<AuthCallbackPage />} />
				<Route path="/" element={<Navigate to="/dashboard" replace />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Outlet />
						</ProtectedRoute>
					}
				>
					<Route index element={<Navigate to="chat" replace />} />
					<Route path="api-keys" element={<APIKeysPage />} />
					<Route path="api-reference" element={<APIReferencePage />} />
					<Route path="chat" element={<PlaygroundChatPage />} />
					<Route path="ai-search" element={<PlaygroundAISearchPage />} />
					<Route path="ehr-summary" element={<EHRSummaryPage />} />
					<Route path="ophth-summary" element={<OphthSummaryPage />} />
					<Route path="rx-advisor" element={<RxAdvisorPage />} />
					<Route path="ehr-converter" element={<EhrConverterPage />} />
					<Route path="document-to-fhir" element={<DocumentToFhirPage />} />
					<Route path="knowledge-base" element={<KnowledgeBasePage />} />
					<Route path="bhxh-validator" element={<BhxhValidatorPage />} />
					<Route path="bhxh-error-codes" element={<BhxhErrorCodesPage />} />
					<Route path="voice-agent" element={<VoiceAgentPage />} />
					<Route path="voice-transcribe" element={<VoiceTranscribePage />} />
					<Route path="medical-image" element={<MedicalImagePage />} />
					<Route path="health-score" element={<HealthScorePage />} />
					<Route path="data-masking" element={<DataMaskingPage />} />
					<Route path="patient-history" element={<PatientHistoryPage />} />
					<Route path="wearable-data" element={<WearableDataPage />} />
					<Route path="architecture" element={<ArchitecturePage />} />
					<Route path="integration" element={<IntegrationDashboardPage />} />
					<Route path="public-health" element={<PublicHealthPage />} />
					<Route path="api-flow-builder" element={<ApiFlowBuilderPage />} />
					<Route path="dashboard-builder" element={<DashboardBuilderPage />} />
					<Route path="symptom-checker" element={<SymptomCheckerPage />} />
					<Route path="gene-decoder" element={<GeneDecoderPage />} />
					<Route path="cross-search" element={<CrossSearchPage />} />
					<Route path="blood-panel" element={<BloodPanelPage />} />
					<Route path="ehr-overview" element={<EHROverviewPage />} />
					<Route path="patient-analytics" element={<PatientAnalyticsPage />} />
					<Route path="clinic-search" element={<ClinicSearchPage />} />
					<Route path="digital-twin" element={<DigitalTwinPage />} />
					<Route
						path="federated-learning"
						element={<FederatedLearningPage />}
					/>
					<Route
						path="healthcare-dashboard"
						element={<HealthcareDashboardPage />}
					/>
					<Route path="a2ui" element={<A2UIPlaygroundPage />} />
					<Route path="settings" element={<SettingsPage />} />
					<Route path="billing" element={<BillingPage />} />
					<Route path="upgrade" element={<UpgradePage />} />
				</Route>
				{/* Redirect old dashboard routes to new ones under /dashboard for backward compatibility. */}
				{dashboardRoutes.map((path) => (
					<Route
						key={path}
						path={`/${path}`}
						element={<Navigate to={`/dashboard/${path}`} replace />}
					/>
				))}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

function App() {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<QueryClientProvider client={query_client}>
				<IamProvider>
					<BrowserRouter>
						<Toaster />
						<AppRoutes />
					</BrowserRouter>
				</IamProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default App;
