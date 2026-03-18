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
import OrganizationBillingPreferences from "./features/organization/components/organization-billing/organization-billing-preferences";
import OrganizationProjects from "./routes/organization-projects";

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
										<OrganizationPeoplePage />
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
							<Route
								path="billing"
								element={
									<ProtectedRoute>
										<OrganizationBilling />
									</ProtectedRoute>
								}
							>
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
									path="preferences"
									element={<OrganizationBillingPreferences />}
								/>
							</Route>
							<Route
								path="projects"
								element={
									<ProtectedRoute>
										<OrganizationProjects />
									</ProtectedRoute>
								}
							/>
						</Route>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</BrowserRouter>
			</KeycloakProvider>
		</QueryClientProvider>
	);
}

export default App;
