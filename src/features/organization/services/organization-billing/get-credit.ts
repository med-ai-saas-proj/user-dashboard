import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { Credits, GetCreditsResponse } from "../../types/billing";

export type GetCreditParams = {
	project_uids?: string[] | null;
	org_ids?: string[] | null;
	status?: string | null;
	limit?: number | null;
	offset?: number | null;
};

export const getCredits = async (params: GetCreditParams): Promise<Credits> => {
	const response = await apiClient.get<GetCreditsResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/credits`,
		{
			params: {
				project_uids: params.project_uids || null,
				org_ids: params.org_ids || null,
				status: params.status || null,
				limit: params.limit || null,
				offset: params.offset || null,
			},
		}
	);
	return {
		success: response.data.success,
		data: response.data.data.map((item) => ({
			creditUID: item.credit_uid,
			amount: item.amount,
			name: item.name,
			currentSpent: item.current_spent,
			startMonth: item.start_month,
			startYear: item.start_year,
			expMonth: item.exp_month,
			expYear: item.exp_year,
			note: item.note,
		})),
		total: response.data.total,
		offset: response.data.offset,
		limit: response.data.limit,
	};
};
