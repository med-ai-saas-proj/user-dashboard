import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationProject } from "@/features/organization/organization.type";
import apiClient from "@/query/api-client";

export const getProjectDetails = async (projectId: string) => {
	const response = await apiClient.get<OrganizationProject>(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}`
	);
	return response.data;
};
