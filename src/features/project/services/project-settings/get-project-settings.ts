import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectSettings } from "../../project.type";

export const getProjectSettings = async (projectId: string) => {
	const response = await apiClient.get<ProjectSettings>(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/settings`
	);

	return response.data;
};
