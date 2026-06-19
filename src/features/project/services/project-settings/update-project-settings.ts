import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectSettings } from "../../project.type";

export const updateProjectSettings = async (
	projectId: string,
	data: ProjectSettings
) => {
	const response = await apiClient.patch(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/settings`,
		data
	);
	return response.data;
};
