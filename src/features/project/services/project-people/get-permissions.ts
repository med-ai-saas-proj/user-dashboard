import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectPermissions } from "../../project.type";

export const getPermissions = async () => {
	const response = await apiClient.get<ProjectPermissions>(
		`${API_ROUTES.MANAGEMENT.PROJECT}/permissions`
	);
	return response.data;
};
