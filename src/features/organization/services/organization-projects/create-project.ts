import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type OrganizationProjectCreateCredentials = {
	organizationId: string;
	projectName: string;
	projectDescription: string;
};

export const createProject = async (
	credentials: OrganizationProjectCreateCredentials
) => {
	const response = await apiClient.post(
		API_ROUTES.MANAGEMENT.PROJECT,
		{
			name: credentials.projectName,
			description: credentials.projectDescription,
		},
		{
			params: {
				organization: credentials.organizationId,
			},
		}
	);
	return response.data;
};
