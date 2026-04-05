import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";

export type UpdateProjectCredentials = {
	projectId: string;
	projectName: string;
	projectDescription?: string;
};

export const updateProject = async (credentials: UpdateProjectCredentials) => {
	const response = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${credentials.projectId}`,
		{
			name: credentials.projectName,
			description: credentials.projectDescription,
		}
	);
	return response.data;
};
