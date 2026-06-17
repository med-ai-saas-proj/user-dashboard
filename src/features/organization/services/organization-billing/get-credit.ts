import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { Credits } from "../../types/billing";

export const getCredits = async (): Promise<Credits> => {
	const response = await apiClient.get<Credits>(
		`${API_ROUTES.MANAGEMENT.BILLING}/credits/available`
	);
	return response.data;
};
