import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationProjectArchive } from "../../organization.type";

export type OrganizationProjectArchiveCredentials = {
	projectId: string;
};

export const archiveProject = async ({
	projectId,
}: OrganizationProjectArchiveCredentials) => {
	const response = await apiClient.post<OrganizationProjectArchive>(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/archive`
	);
	return response.data;
};
