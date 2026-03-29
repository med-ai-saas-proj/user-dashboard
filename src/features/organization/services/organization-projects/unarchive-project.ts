import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationProjectArchive } from "../../organization.type";

export type OrganizationProjectUnarchiveCredentials = {
	projectId: string;
};

export const unarchiveProject = async ({
	projectId,
}: OrganizationProjectUnarchiveCredentials) => {
	const response = await apiClient.post<OrganizationProjectArchive>(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/unarchive`
	);
	return response.data;
};
