import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRole } from "../../project.type";

export type GetAllProjectRolesParams = {
	projectId: string;
	offset?: number;
	limit?: number;
};

export const getAllProjectRoles = async (
	params: GetAllProjectRolesParams
): Promise<ProjectRole[]> => {
	const { projectId } = params;

	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE}/${projectId}/roles`,
		{
			params: {
				offset: params.offset,
				limit: params.limit,
			},
		}
	);

	const data = await response.data;
	return data as ProjectRole[];
};
