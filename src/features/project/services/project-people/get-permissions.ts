import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const getPermissions = async () => {
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.PROJECT}/permissions`
	);
	return response.data;
};
