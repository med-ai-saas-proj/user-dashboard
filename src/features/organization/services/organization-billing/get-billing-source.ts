import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { GetBillingSourceResponse } from "../../types/billing";

export const getBillingSource = async () => {
	const response = await apiClient.get<GetBillingSourceResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources`
	);
	return response.data;
};
