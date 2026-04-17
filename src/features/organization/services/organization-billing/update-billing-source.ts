import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { UpdateBillingSourceCredentials } from "../../types/billing";

export const updateBillingSource = async (
	credentials: UpdateBillingSourceCredentials
) => {
	const response = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources`,
		credentials
	);
	return response.data;
};
