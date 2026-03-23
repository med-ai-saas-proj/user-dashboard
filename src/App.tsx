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
import DashboardPage from "@/routes/dashboard";
import SettingPage from "@/routes/setting";
import SettingOrganizationPeoplePage from "@/routes/setting-organization-people";
import OrganizationPeopleInvitation from "./features/organization/components/organization-people/organization-people-invitation";
import OrganizationPeopleMember from "./features/organization/components/organization-people/organization-people-member";
import ProjectGeneral from "./routes/project-general";
import ProjectPeople from "./routes/project-people";
import ProjectPeopleMember from "./features/project/components/project-people/project-people-member";
import ProjectPeopleRole from "./features/project/components/project-people/project-people-role";

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
						<Route path="/dashboard" element={<DashboardPage />} />
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
							path="/settings"
							element={
								<ProtectedRoute>
									<SettingPage />
								</ProtectedRoute>
							}
						/>
						<Route path="/organization">
							<Route
								path="people"
								element={
									<ProtectedRoute>
										<SettingOrganizationPeoplePage />
									</ProtectedRoute>
								}
							>
								<Route index element={<Navigate to="members" replace />} />
								<Route path="members" element={<OrganizationPeopleMember />} />
								<Route
									path="invitations"
									element={<OrganizationPeopleInvitation />}
								/>
							</Route>
						</Route>
						<Route path="/project">
							<Route index element={<Navigate to="general" replace />} />
							<Route
								path="general"
								element={
									<ProtectedRoute>
										<ProjectGeneral />
									</ProtectedRoute>
								}
							/>
							<Route
								path="people"
								element={
									<ProtectedRoute>
										<ProjectPeople />
									</ProtectedRoute>
								}
							>
								<Route index element={<Navigate to="members" replace />} />
								<Route path="members" element={<ProjectPeopleMember />} />
								<Route path="roles" element={<ProjectPeopleRole />} />
							</Route>
						</Route>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</BrowserRouter>
			</KeycloakProvider>
		</QueryClientProvider>
	);
}

export default App;
