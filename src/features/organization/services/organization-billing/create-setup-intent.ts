import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export interface SetupIntentResponse {
	client_secret?: string;
	clientSecret?: string;
	id?: string;
	status?: "requires_payment_method" | "processing" | "succeeded";
}

export const createSetupIntent = async (): Promise<SetupIntentResponse> => {
	const response = await apiClient.post<SetupIntentResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/setup_intents`
	);
	return response.data;
};
