import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectPermissions } from "../../project.type";

export type GetProjectPermissionsParams = {
	projectId: string;
	userId: string;
};

export const getUserProjectPermissions = async (
	params: GetProjectPermissionsParams
): Promise<ProjectPermissions> => {
	const { projectId, userId } = params;

	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/users/${userId}/permissions`
	);

	const data = await response.data;
	return data as ProjectPermissions;
};
