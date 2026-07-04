import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const getAvailableApiReferenceServices = async () => {
	const response = await apiClient.get<string[]>(API_ROUTES.SERVICES.AVAILABLE);
	console.log(response);

	return response.data;
};
