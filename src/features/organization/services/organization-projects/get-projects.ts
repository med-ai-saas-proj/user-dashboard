import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationProjectsResponse } from "../../organization.type";

export type OrganizationProjectsParams = {
	organizationId: string;
	offset?: number;
	limit?: number;
};

export const getOrganizationProjects = async (
	params: OrganizationProjectsParams
) => {
	const response = await apiClient.get<OrganizationProjectsResponse>(
		API_ROUTES.MANAGEMENT.PROJECT,
		{
			params: {
				organization: params.organizationId,
				offset: params.offset,
				limit: params.limit,
			},
		}
	);
	return response.data;
};
