import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { GetPaymentMethod } from "../../types/billing";

export const getPaymentMethods = async () => {
	const response = await apiClient.get<GetPaymentMethod[]>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/payment_methods`
	);
	return response.data;
};
