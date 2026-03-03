import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { StatCardData } from "../dashboard.type";

import { totalCostKPI, totalRequestsKPI } from "./charts.config";

export const getKPICard = async (): Promise<StatCardData[]> => {
	try {
		const response = await apiClient.get<StatCardData[]>(
			API_ROUTES.SERVICES.DASHBOARD
		);
		return response.data;
	} catch (error) {
		return [totalRequestsKPI, totalCostKPI];
	}
};
