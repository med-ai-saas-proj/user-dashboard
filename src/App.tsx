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
import OrganizationPeoplePage from "@/routes/organization-people";
import OrganizationPeopleInvitation from "./features/organization/components/organization-people/organization-people-invitation";
import OrganizationPeopleMember from "./features/organization/components/organization-people/organization-people-member";
import OrganizationBilling from "./routes/organization-billing";
import OrganizationBillingOverview from "./features/organization/components/organization-billing/organization-billing-overview";
import OrganizationBillingPaymentMethods from "./features/organization/components/organization-billing/organization-billing-payment-methods";
import OrganizationBillingHistory from "./features/organization/components/organization-billing/organization-billing-history";
import OrganizationBillingCreditGrants from "./features/organization/components/organization-billing/organization-billing-credit-grants";
import OrganizationProjects from "./routes/organization-projects";
import ProjectGeneral from "./routes/project-general";
import ProjectPeople from "./routes/project-people";
import ProjectPeopleMember from "./features/project/components/project-people/project-people-member";
import ProjectPeopleRole from "./features/project/components/project-people/project-people-role";
import ProjectRouteGuard from "./routes/project-route-guard";
import ProjectBucketsPage from "./routes/project-buckets";
import DashboardAggregateOrganization from "./features/dashboard/components/dashboard-aggregate-organization";
import DashboardAggregateProjects from "./features/dashboard/components/dashboard-aggregate-projects";
import OrganizationBillingActivityLog from "./features/organization/components/organization-billing/organization-billing-activity-log";
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
							<Route path="/dashboard" element={<DashboardPage />}>
								<Route index element={<Navigate to="organization" replace />} />
								<Route
									path="organization"
									element={<DashboardAggregateOrganization />}
								/>
								<Route
									path="project"
									element={<DashboardAggregateProjects />}
								/>
							</Route>
							<Route path="/api-keys" element={<APIKeysPage />} />
							<Route path="/api-reference" element={<APIReferencePage />} />
							<Route path="/chat" element={<PlaygroundChatPage />} />
							<Route path="/ai-search" element={<PlaygroundAISearchPage />} />
							<Route path="/ehr-summary" element={<EHRSummaryPage />} />
							<Route path="/rx-advisor" element={<RxAdvisorPage />} />
							<Route path="/settings" element={<SettingPage />} />
							<Route path="/organization">
								<Route path="people" element={<OrganizationPeoplePage />}>
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
								<Route path="billing" element={<OrganizationBilling />}>
									<Route index element={<Navigate to="overview" replace />} />
									<Route
										path="overview"
										element={<OrganizationBillingOverview />}
									/>
									<Route
										path="payment-methods"
										element={<OrganizationBillingPaymentMethods />}
									/>
									<Route
										path="billing-history"
										element={<OrganizationBillingHistory />}
									/>
									<Route
										path="credit-grants"
										element={<OrganizationBillingCreditGrants />}
									/>
									<Route
										path="activity-log"
										element={<OrganizationBillingActivityLog />}
									/>
								</Route>
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
									<Route path="buckets" element={<ProjectBucketsPage />} />
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
