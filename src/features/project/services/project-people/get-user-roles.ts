import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRole } from "../../project.type";

export type GetProjectRolesParams = {
	projectId: string;
	userId: string;
};

export const getUserProjectRoles = async (
	params: GetProjectRolesParams
): Promise<ProjectRole[]> => {
	const { projectId, userId } = params;

	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE.replace(":projectId", projectId)}/users/${userId}/roles`
	);

	const data = await response.data;
	return data as ProjectRole[];
};
