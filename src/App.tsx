import "./config/i18n";

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
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
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
import SettingsPage from "@/routes/settings";
import BillingPage from "@/routes/billing";
import UpgradePage from "@/routes/upgrade";

function App() {
	return (
		<QueryClientProvider client={query_client}>
			<KeycloakProvider>
				<BrowserRouter>
					<Toaster />
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
				</BrowserRouter>
			</KeycloakProvider>
		</QueryClientProvider>
	);
}

export default App;
