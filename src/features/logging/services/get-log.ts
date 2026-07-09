import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { LoggingParams } from "../types/logging";

export const getLog = async (params: LoggingParams) => {
	const response = await apiClient.get(API_ROUTES.MANAGEMENT.LOGGING, {
		params: {
			start: params.start,
			end: params.end,
			limit: params.limit,
			direction: params.direction,
			level: params.level,
			keyword: params.keyword,
			filters: params.filters,
			custom_query: params.customQuery,
		},
	});
	return response.data;
};
