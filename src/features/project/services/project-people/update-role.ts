import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRole } from "../../project.type";

export type UpdateProjectRoleCredentials = {
	projectId: string;
	roleId: string;
	roleName: string;
	description: string;
};

export const updateProjectRole = async (
	credentials: UpdateProjectRoleCredentials
): Promise<ProjectRole> => {
	const { projectId, roleId, roleName, description } = credentials;

	const response = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE.replace(":projectId", projectId)}/roles/${roleId}`,
		{
			roleName,
			description,
		} satisfies Omit<ProjectRole, "id">
	);

	const data = await response.data;
	return data as ProjectRole;
};
