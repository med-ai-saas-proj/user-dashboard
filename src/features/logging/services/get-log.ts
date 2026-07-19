import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { LoggingParams, LoggingResponse } from "../types/logging";

export const getLog = async (params: LoggingParams) => {
	const response = await apiClient.get<LoggingResponse>(
		API_ROUTES.MANAGEMENT.LOGGING,
		{
			params: {
				start: params.start,
				end: params.end,
				limit: params.limit,
				direction: params.direction,
				level: params.level,
				keyword: params.keyword,
				filters: params.filters,
				custom_query: params.custom_query,
			},
		}
	);
	return response.data;
};
