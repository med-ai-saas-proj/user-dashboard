import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRole } from "../../project.type";

export type CreateProjectRoleCredentials = {
	projectId: string;
	roleName: string;
	description: string;
};

export const createProjectRole = async (
	credentials: CreateProjectRoleCredentials
): Promise<ProjectRole> => {
	const { projectId } = credentials;

	const response = await apiClient.post(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE.replace(":projectId", projectId)}/roles`,
		{
			roleName: credentials.roleName,
			description: credentials.description,
		} satisfies Omit<ProjectRole, "id">
	);

	const data = await response.data;
	return data as ProjectRole;
};
