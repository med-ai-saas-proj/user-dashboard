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
import EhrIngestPage from "@/routes/ehr-ingest";
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
import WhitepaperPage from "@/routes/whitepaper";
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
	{ path: "api-keys", component: APIKeysPage },
	{ path: "api-reference", component: APIReferencePage },
	{ path: "chat", component: PlaygroundChatPage },
	{ path: "ai-search", component: PlaygroundAISearchPage },
	{ path: "ehr-summary", component: EHRSummaryPage },
	{ path: "ophth-summary", component: OphthSummaryPage },
	{ path: "rx-advisor", component: RxAdvisorPage },
	{ path: "ehr-converter", component: EhrConverterPage },
	{ path: "document-to-fhir", component: DocumentToFhirPage },
	{ path: "knowledge-base", component: KnowledgeBasePage },
	{ path: "bhxh-validator", component: BhxhValidatorPage },
	{ path: "bhxh-error-codes", component: BhxhErrorCodesPage },
	{ path: "voice-agent", component: VoiceAgentPage },
	{ path: "voice-transcribe", component: VoiceTranscribePage },
	{ path: "medical-image", component: MedicalImagePage },
	{ path: "health-score", component: HealthScorePage },
	{ path: "data-masking", component: DataMaskingPage },
	{ path: "patient-history", component: PatientHistoryPage },
	{ path: "wearable-data", component: WearableDataPage },
	{ path: "architecture", component: ArchitecturePage },
	{ path: "integration", component: IntegrationDashboardPage },
	{ path: "public-health", component: PublicHealthPage },
	{ path: "api-flow-builder", component: ApiFlowBuilderPage },
	{ path: "dashboard-builder", component: DashboardBuilderPage },
	{ path: "symptom-checker", component: SymptomCheckerPage },
	{ path: "gene-decoder", component: GeneDecoderPage },
	{ path: "cross-search", component: CrossSearchPage },
	{ path: "blood-panel", component: BloodPanelPage },
	{ path: "ehr-overview", component: EHROverviewPage },
	{ path: "patient-analytics", component: PatientAnalyticsPage },
	{ path: "clinic-search", component: ClinicSearchPage },
	{ path: "digital-twin", component: DigitalTwinPage },
	{ path: "federated-learning", component: FederatedLearningPage },
	{ path: "healthcare-dashboard", component: HealthcareDashboardPage },
	{ path: "a2ui", component: A2UIPlaygroundPage },
	{ path: "settings", component: SettingsPage },
	{ path: "billing", component: BillingPage },
	{ path: "upgrade", component: UpgradePage },
	{ path: "ehr-ingest", component: EhrIngestPage },
] as const;

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/whitepaper" replace />} />
			<Route path="/whitepaper" element={<WhitepaperPage />} />
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

			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Outlet />
					</ProtectedRoute>
				}
			>
				<Route index element={<Navigate to="chat" replace />} />
				{dashboardRoutes.map(({ path, component }) => (
					<Route key={path} path={path} Component={component} />
				))}
			</Route>
			{/* Redirect old dashboard routes to new ones under /dashboard for backward compatibility. */}
			{dashboardRoutes.map(({ path }) => (
				<Route
					key={path}
					path={`/${path}`}
					element={<Navigate to={`/dashboard/${path}`} replace />}
				/>
			))}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

function App() {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<QueryClientProvider client={query_client}>
				<IamProvider>
					<BrowserRouter>
						<PreventScrollReset />
						<Toaster />
						<AppRoutes />
					</BrowserRouter>
				</IamProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default App;
