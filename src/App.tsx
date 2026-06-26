import "./config/i18n";

import { KeycloakProvider } from "@/features/auth/providers/keycloak-provider";
import { AppLayout } from "@/layouts/app-layout";
import { query_client } from "@/query/query-client";
import APIKeysPage from "@/routes/api-keys";
import APIReferencePage from "@/routes/api-reference";
import DashboardPage from "@/routes/dashboard";
import LoginPage from "@/routes/login";
import OrganizationPeoplePage from "@/routes/organization-people";
import { ProtectedRoute } from "@/routes/protected-route";
import { PublicRoute } from "@/routes/public-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import DashboardAggregateOrganization from "./features/dashboard/components/dashboard-aggregate-organization";
import DashboardAggregateProjects from "./features/dashboard/components/dashboard-aggregate-projects";
import OrganizationBillingActivityLog from "./features/organization/components/organization-billing/organization-billing-activity-log";
import OrganizationBillingCreditGrants from "./features/organization/components/organization-billing/organization-billing-credit-grants";
import OrganizationBillingHistory from "./features/organization/components/organization-billing/organization-billing-history";
import OrganizationBillingOverview from "./features/organization/components/organization-billing/organization-billing-overview";
import OrganizationBillingPaymentMethods from "./features/organization/components/organization-billing/organization-billing-payment-methods";
import OrganizationPeopleInvitation from "./features/organization/components/organization-people/organization-people-invitation";
import OrganizationPeopleMember from "./features/organization/components/organization-people/organization-people-member";
import ProjectPeopleMember from "./features/project/components/project-people/project-people-member";
import ProjectPeopleRole from "./features/project/components/project-people/project-people-role";
import OrganizationBilling from "./routes/organization-billing";
import OrganizationProjects from "./routes/organization-projects";
import ProjectBucketsPage from "./routes/project-buckets";
import ProjectGeneral from "./routes/project-general";
import ProjectPeople from "./routes/project-people";
import ProjectRouteGuard from "./routes/project-route-guard";
import OrganizationSettings from "./features/organization/components/organization-settings/organization-settings";
import ProjectSettings from "./features/project/components/project-settings/project-settings";

function App() {
	return (
		<QueryClientProvider client={query_client}>
			<KeycloakProvider>
				<BrowserRouter>
					<Toaster richColors />
					<Routes>
						<Route
							path="/login"
							element={
								<PublicRoute>
									<LoginPage />
								</PublicRoute>
							}
						/>

						<Route path="/" element={<Navigate to="/dashboard" replace />} />

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
								<Route path="settings" element={<OrganizationSettings />} />
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
									<Route path="settings" element={<ProjectSettings />} />
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
