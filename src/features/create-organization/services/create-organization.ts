import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type CreateOrganizationCredentials = {
	name: string;
	alias: string;
};

export const createOrganization = async (
	credentials: CreateOrganizationCredentials
) => {
	const response = await apiClient.post(API_ROUTES.MANAGEMENT.ORGANIZATION, {
		name: credentials.name,
		alias: credentials.alias,
	});

	return response.data;
}; // create organization service
// request is api_client.post(
// "/v1/organizations",
// headers=AUTH,
// json={"name": "New Org", "alias": "new-org"},
// )
