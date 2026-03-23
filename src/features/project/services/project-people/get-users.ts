import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectUserResponse } from "../../project.type";

export type GetProjectUsersParams = {
	projectId: string;
	limit?: number;
	offset?: number;
	q?: string;
};

export const getProjectUsers = async (
	params: GetProjectUsersParams
): Promise<ProjectUserResponse> => {
	const { projectId, limit, offset, q } = params;

	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE.replace(":projectId", projectId)}/users`,
		{
			params: {
				offset,
				limit,
				q,
			},
		}
	);
	return response.data;
};
