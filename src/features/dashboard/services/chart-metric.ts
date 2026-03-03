import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { ChartDataset } from "../dashboard.type";

import { chartData } from "./charts.config";

export type GetChartParams = {
	from?: string;
	to?: string;
};

export const getChartMetric = async (
	params?: GetChartParams
): Promise<ChartDataset[]> => {
	if (!params) {
		const today = new Date();
		const priorDate = new Date().setDate(today.getDate() - 30);
		params = {
			from: new Date(priorDate).toISOString().split("T")[0],
			to: new Date().toISOString().split("T")[0],
		};
	}
	if (!params.from) {
		params.from = new Date().toISOString().split("T")[0];
	}
	if (!params.to) {
		params.to = new Date().toISOString().split("T")[0];
	}

	try {
		const response = await apiClient.get<ChartDataset[]>(
			API_ROUTES.SERVICES.DASHBOARD,
			{ params }
		);

		return response.data;
	} catch (error) {
		// fallback mock
		return chartData;
	}
};
