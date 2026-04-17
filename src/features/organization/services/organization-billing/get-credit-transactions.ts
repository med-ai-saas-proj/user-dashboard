import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { CreditTransactions } from "../../types/billing";

export type GetCreditTransactionsParams = {
	offset?: number;
	limit?: number;
};

export const getCreditTransactions = async (
	params: GetCreditTransactionsParams
) => {
	const response = await apiClient.get<CreditTransactions>(
		`${API_ROUTES.MANAGEMENT.BILLING}/credits/transactions`,
		{
			params,
		}
	);
	return response.data;
};
