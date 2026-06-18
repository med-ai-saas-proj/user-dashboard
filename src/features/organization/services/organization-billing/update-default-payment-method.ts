import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { GetPaymentMethod } from "../../types/billing";

export const updateDefaultPaymentMethod = async (paymentMethodId: string) => {
	const response = await apiClient.post<GetPaymentMethod>(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/payment_method/default?payment_method_id=${paymentMethodId}`
	);
	return response.data;
};
