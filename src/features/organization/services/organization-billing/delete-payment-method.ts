import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type DeletePaymentMethodParams = {
	paymentMethodId: string;
};

export const deletePaymentMethod = async (
	params: DeletePaymentMethodParams
) => {
	const response = await apiClient.delete(
		`${API_ROUTES.MANAGEMENT.BILLING}/sources/payment_method/${params.paymentMethodId}`
	);
	return response.data;
};
