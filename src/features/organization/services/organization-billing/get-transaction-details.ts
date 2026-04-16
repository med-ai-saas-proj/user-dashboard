import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { BillingTransactionDetails } from "../../types/billing";

export const getTransactionDetails = async (
	transactionUid: string
): Promise<BillingTransactionDetails> => {
	const response = await apiClient.get<BillingTransactionDetails>(
		`${API_ROUTES.MANAGEMENT.BILLING}/transactions/${transactionUid}`
	);
	return response.data;
};
