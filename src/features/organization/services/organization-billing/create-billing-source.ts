import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type {
	CreateBillingSourceCredentials,
	CreateBillingSourceResponse,
} from "../../types/billing";

export const createBillingSource = async (
	credentials: CreateBillingSourceCredentials
) => {
	const response = await apiClient.post<CreateBillingSourceResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources`,
		credentials
	);
	return response.data;
};
