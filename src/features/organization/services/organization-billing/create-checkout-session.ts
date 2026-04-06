import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { CreateCheckoutSessionResponse } from "../../types/stripe";

export const createCheckoutSession = async (): Promise<string> => {
	const res = await apiClient.post<CreateCheckoutSessionResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/setup_intents`
	);

	return res.data.clientSecret;
};
