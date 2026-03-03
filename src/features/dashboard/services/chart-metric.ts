import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { ChartDataset } from "../dashboard.type";

import { chartData } from "./charts.config";

export type GetChartParams = {
	from?: string;
	to?: string;
};

export const getChartMetric = async (
	params: GetChartParams
): Promise<ChartDataset[]> => {
	try {
		const response = await apiClient.get<ChartDataset[]>(
			API_ROUTES.SERVICES.DASHBOARD,
			{ params }
		);

		return response.data;
	} catch {
		return chartData;
	}
};
