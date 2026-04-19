import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const getProjectDetails = async (projectId: string) => {
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}`
	);
	return response.data;
};
