import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectUserResponse } from "../../project.type";

export type AddProjectUserParams = {
	projectId: string;
	userId: string;
};

export const addProjectUser = async (
	params: AddProjectUserParams
): Promise<ProjectUserResponse> => {
	const { projectId, userId } = params;

	const response = await apiClient.post(
		`${API_ROUTES.MANAGEMENT.PROJECT.PEOPLE}/${projectId}/users`,
		{
			userId,
		}
	);
	return response.data;
};
