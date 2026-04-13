import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { Aggregate, AggregateParams } from "../dashboard.type";

export const getAggregateByProjects = async (
	params: AggregateParams & { projectUids: string[] }
): Promise<Aggregate> => {
	const response = await apiClient.get<Aggregate>(
		`${API_ROUTES.MANAGEMENT.BILLING}/aggregates/projects`,
		{
			params: {
				period_start: params.periodStart,
				period_end: params.periodEnd,
				period: params.period,
				period_scale: params.periodScale,
				project_uids: params.projectUids,
			},
		}
	);
	return response.data;
};
