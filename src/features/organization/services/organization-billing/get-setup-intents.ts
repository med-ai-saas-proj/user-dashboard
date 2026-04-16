import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const getSetupIntents = async () => {
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/setup_intents/required_actions`
	);
	return response.data;
};
