import { useQuery } from "@tanstack/react-query";
import { getChartMetric } from "../services/chart-metric";

export const useGetChartMetric = (params?: { from: string; to: string }) => {
	return useQuery({
		queryKey: ["dashboardMetrics", params],
		queryFn: () => getChartMetric(params),
	});
};
