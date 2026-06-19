import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ApiPermissions } from "./api-key.dto";

export const getAPIKeyPermissions = async () => {
	const response = await apiClient.get<ApiPermissions>(
		`${API_ROUTES.MANAGEMENT.API_KEYS}/permissions`
	);
	return response.data;
};
