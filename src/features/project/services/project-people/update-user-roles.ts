import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRole } from "../../project.type";

export type UpdateProjectRolesParams = {
	projectId: string;
	userId: string;
	roles: string[];
};

export const updateProjectRoles = async (
	params: UpdateProjectRolesParams
): Promise<ProjectRole[]> => {
	const { projectId, userId, roles } = params;
	const response = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE}/${projectId}/users/${userId}/roles`,
		{
			roles,
		}
	);
	return response.data;
};
