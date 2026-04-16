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
import OrganizationProjects from "./routes/organization-projects";
import ProjectRouteGuard from "./routes/project-route-guard";
import { AppLayout } from "@/layouts/app-layout";

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

						{/* App layout wraps all protected routes and provides persistent sidebar */}
						<Route
							element={
								<ProtectedRoute>
									<AppLayout />
								</ProtectedRoute>
							}
						>
							<Route path="/dashboard" element={<DashboardPage />} />
							<Route path="/api-keys" element={<APIKeysPage />} />
							<Route path="/api-reference" element={<APIReferencePage />} />
							<Route path="/chat" element={<PlaygroundChatPage />} />
							<Route path="/ai-search" element={<PlaygroundAISearchPage />} />
							<Route path="/ehr-summary" element={<EHRSummaryPage />} />
							<Route path="/rx-advisor" element={<RxAdvisorPage />} />
							<Route path="/settings" element={<SettingPage />} />

							<Route path="/organization">
								<Route
									path="people"
									element={<SettingOrganizationPeoplePage />}
								>
									<Route index element={<Navigate to="members" replace />} />
									<Route
										path="members"
										element={<OrganizationPeopleMember />}
									/>
									<Route
										path="invitations"
										element={<OrganizationPeopleInvitation />}
									/>
								</Route>
								<Route path="projects" element={<OrganizationProjects />} />
							</Route>

							<Route path="/project/:projectId">
								<Route element={<ProjectRouteGuard />}>
									<Route index element={<Navigate to="general" replace />} />
									<Route path="general" element={<ProjectGeneral />} />
									<Route path="people" element={<ProjectPeople />}>
										<Route index element={<Navigate to="members" replace />} />
										<Route path="members" element={<ProjectPeopleMember />} />
										<Route path="roles" element={<ProjectPeopleRole />} />
									</Route>
									<Route path="api-keys" element={<APIKeysPage />} />
								</Route>
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
