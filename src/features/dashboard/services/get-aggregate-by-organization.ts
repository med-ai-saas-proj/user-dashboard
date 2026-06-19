import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { Aggregate, AggregateParams } from "../dashboard.type";

export const getAggregateByOrganization = async (
	params: AggregateParams
): Promise<Aggregate> => {
	const response = await apiClient.get<Aggregate>(
		`${API_ROUTES.MANAGEMENT.BILLING}/aggregates/organizations`,
		{
			params: {
				period_start: params.periodStart,
				period_end: params.periodEnd,
				period: params.period,
				period_scale: params.periodScale,
			},
		}
	);
	return response.data;
};
