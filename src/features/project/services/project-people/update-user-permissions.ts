import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectPermissions } from "../../project.type";

export type UpdateProjectPermissionsParams = {
	projectId: string;
	userId: string;
	permissions: string[];
};

export const updateProjectUserPermissions = async (
	params: UpdateProjectPermissionsParams
): Promise<ProjectPermissions> => {
	const { projectId, userId, permissions } = params;
	const response = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/users/${userId}/permissions`,
		{
			permissions,
		}
	);
	return response.data;
};
