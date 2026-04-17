import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { BillingTransactions } from "../../types/billing";

export type GetTransactionListParams = {
	projectUids?: string[];
	startDate?: string;
	endDate?: string;
	offset?: number;
	limit?: number;
};

export const getTransactionList = async (
	params: GetTransactionListParams
): Promise<BillingTransactions> => {
	const response = await apiClient.get<BillingTransactions>(
		`${API_ROUTES.MANAGEMENT.BILLING}/transactions`,
		{
			params: {
				project_uids: params.projectUids,
				start_date: params.startDate,
				end_date: params.endDate,
				offset: params.offset,
				limit: params.limit,
			},
		}
	);
	return response.data;
};
